import { getD1, getMediaBucket } from "../../lib/runtime";
import { getStudioSessionFromRequest } from "../../lib/studio-auth";

type MediaRow = {
  object_key: string;
  content_type: string;
  status: string | null;
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  if (!/^[a-f0-9-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });

  try {
    const asset = await getD1().prepare(`
      SELECT media_assets.object_key, media_assets.content_type, posts.status
      FROM media_assets
      LEFT JOIN posts ON posts.id = media_assets.post_id
      WHERE media_assets.id = ?
      LIMIT 1
    `).bind(id).first<MediaRow>();
    if (!asset) return new Response("Not found", { status: 404 });

    const published = asset.status === "published";
    if (!published && !(await getStudioSessionFromRequest(request))) {
      return new Response("Not found", { status: 404 });
    }

    const object = await getMediaBucket().get(asset.object_key);
    if (!object) return new Response("Not found", { status: 404 });
    return new Response(object.body, {
      headers: {
        "Content-Type": asset.content_type,
        "Content-Length": String(object.size),
        "Cache-Control": published ? "public, max-age=86400, stale-while-revalidate=604800" : "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; img-src 'self'; sandbox",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
