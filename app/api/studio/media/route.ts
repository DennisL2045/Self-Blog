import { getD1, getImageTransformer, getMediaBucket } from "../../../lib/runtime";
import {
  getStudioSessionFromRequest,
  isSameOriginMutation,
} from "../../../lib/studio-auth";
import { hasStudioGatewayAccess, studioNotFoundResponse } from "../../../lib/studio-gateway";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = {
  "image/jpeg": true,
  "image/png": true,
  "image/webp": true,
} as const;

export async function POST(request: Request) {
  if (!(await hasStudioGatewayAccess(request.headers))) return studioNotFoundResponse();
  const session = await getStudioSessionFromRequest(request);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!isSameOriginMutation(request)) return Response.json({ error: "forbidden" }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > MAX_IMAGE_BYTES + 100_000) {
    return Response.json({ error: "圖片不可超過 8 MB" }, { status: 413 });
  }

  let objectKey = "";
  try {
    const form = await request.formData();
    const file = form.get("image");
    const altText = typeof form.get("alt") === "string" ? String(form.get("alt")).trim().slice(0, 160) : "";
    const postId = typeof form.get("postId") === "string" && /^[a-f0-9-]{36}$/i.test(String(form.get("postId")))
      ? String(form.get("postId"))
      : null;
    if (!(file instanceof File)) return Response.json({ error: "請選擇圖片" }, { status: 400 });
    if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
      return Response.json({ error: "圖片不可超過 8 MB" }, { status: 413 });
    }
    const accepted = IMAGE_TYPES[file.type as keyof typeof IMAGE_TYPES];
    if (!accepted) return Response.json({ error: "只接受 JPG、PNG 或 WebP 照片" }, { status: 415 });

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!matchesImageSignature(bytes, file.type)) {
      return Response.json({ error: "檔案內容與圖片格式不符" }, { status: 415 });
    }

    const transformed = await getImageTransformer()
      .input(file.stream())
      .transform({ fit: "scale-down", width: 2400, height: 2400 })
      .output({ format: "image/webp", quality: 85 });
    const sanitizedResponse = transformed.response();
    if (!sanitizedResponse.ok) throw new Error("image_transform_failed");
    const sanitizedBytes = new Uint8Array(await sanitizedResponse.arrayBuffer());

    const id = crypto.randomUUID();
    const now = new Date();
    objectKey = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.webp`;
    await getMediaBucket().put(objectKey, sanitizedBytes, {
      httpMetadata: { contentType: "image/webp", contentDisposition: "inline" },
      customMetadata: { uploadedBy: session.googleSub },
    });
    await getD1().prepare(`
      INSERT INTO media_assets (
        id, post_id, object_key, original_name, content_type, byte_size,
        alt_text, uploaded_by_google_sub, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      postId,
      objectKey,
      file.name.slice(0, 180),
      "image/webp",
      sanitizedBytes.byteLength,
      altText,
      session.googleSub,
      now.toISOString(),
    ).run();

    return Response.json({
      asset: { id, url: `/media/${id}`, alt: altText },
      markdown: `![${altText.replaceAll("]", "")}](/media/${id})`,
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    if (objectKey) await getMediaBucket().delete(objectKey).catch(() => undefined);
    return Response.json({ error: "圖片上傳失敗，請稍後再試" }, { status: 500 });
  }
}

function matchesImageSignature(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.slice(0, 8).every((value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index]);
  if (type === "image/webp") return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  return false;
}
