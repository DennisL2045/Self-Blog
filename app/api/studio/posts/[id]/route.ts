import {
  archivePost,
  getPostById,
  normalizePostInput,
  updatePost,
} from "../../../../lib/posts";
import {
  getStudioSessionFromRequest,
  isSameOriginMutation,
} from "../../../../lib/studio-auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  const session = await getStudioSessionFromRequest(request);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!isSameOriginMutation(request)) return Response.json({ error: "forbidden" }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 300_000) {
    return Response.json({ error: "內容超過可接受大小" }, { status: 413 });
  }

  try {
    const id = (await params).id;
    const current = await getPostById(id);
    if (!current) return Response.json({ error: "找不到文章" }, { status: 404 });
    const payload = await request.json() as Record<string, unknown>;
    if (typeof payload.updatedAt === "string" && payload.updatedAt !== current.updatedAt) {
      return Response.json({ error: "這篇文章已在其他裝置更新，請重新整理後再編輯" }, { status: 409 });
    }
    const input = normalizePostInput(payload, current);
    const post = await updatePost(id, input, session);
    return Response.json({ post }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "無法儲存文章";
    const conflict = /unique|constraint/i.test(message);
    return Response.json({ error: conflict ? "這個網址代稱已經被使用" : message }, { status: conflict ? 409 : 400 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const session = await getStudioSessionFromRequest(request);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!isSameOriginMutation(request)) return Response.json({ error: "forbidden" }, { status: 403 });

  try {
    const post = await archivePost((await params).id, session);
    if (!post) return Response.json({ error: "找不到文章" }, { status: 404 });
    return Response.json({ post }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "無法封存文章" }, { status: 500 });
  }
}
