import {
  createPost,
  listStudioPosts,
  normalizePostInput,
} from "../../../lib/posts";
import {
  getStudioSessionFromRequest,
  isSameOriginMutation,
} from "../../../lib/studio-auth";

export async function GET(request: Request) {
  const session = await getStudioSessionFromRequest(request);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    return Response.json({ posts: await listStudioPosts() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "文章資料暫時無法讀取" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getStudioSessionFromRequest(request);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!isSameOriginMutation(request)) return Response.json({ error: "forbidden" }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 300_000) {
    return Response.json({ error: "內容超過可接受大小" }, { status: 413 });
  }

  try {
    const input = normalizePostInput(await request.json());
    const post = await createPost(input, session);
    return Response.json({ post }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "無法建立文章";
    const conflict = /unique|constraint/i.test(message);
    return Response.json({ error: conflict ? "這個網址代稱已經被使用" : message }, { status: conflict ? 409 : 400 });
  }
}
