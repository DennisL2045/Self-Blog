import { expiredStudioSessionCookie, isSameOriginMutation } from "../../../lib/studio-auth";

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return new Response("Forbidden", { status: 403 });
  const headers = new Headers({
    Location: new URL("/studio", request.url).toString(),
    "Cache-Control": "no-store",
    "Set-Cookie": expiredStudioSessionCookie(request),
  });
  return new Response(null, { status: 303, headers });
}
