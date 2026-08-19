import { expiredStudioSessionCookie, isSameOriginMutation } from "../../../lib/studio-auth";

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return new Response("Forbidden", { status: 403 });
  const response = Response.redirect(new URL("/studio", request.url), 303);
  response.headers.set("Set-Cookie", expiredStudioSessionCookie(request));
  response.headers.set("Cache-Control", "no-store");
  return response;
}
