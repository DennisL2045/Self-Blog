import {
  createStudioSessionToken,
  expiredStudioSessionCookie,
  getStudioSessionFromRequest,
  readCookie,
  studioSessionCookie,
  verifyGoogleCredential,
} from "../../../lib/studio-auth";
import { hasStudioGatewayAccess, studioNotFoundResponse } from "../../../lib/studio-gateway";

export async function GET(request: Request) {
  if (!(await hasStudioGatewayAccess(request.headers))) return studioNotFoundResponse();
  const session = await getStudioSessionFromRequest(request);
  const headers = new Headers({ "Cache-Control": "no-store" });
  if (!session) headers.set("Set-Cookie", expiredStudioSessionCookie(request));
  return Response.json(
    { authenticated: Boolean(session), expiresAt: session?.expiresAt ?? null },
    { status: session ? 200 : 401, headers },
  );
}

export async function POST(request: Request) {
  if (!(await hasStudioGatewayAccess(request.headers))) return studioNotFoundResponse();
  let error = "invalid";
  try {
    const form = await request.formData();
    const credential = form.get("credential");
    const csrfBody = form.get("g_csrf_token");
    const csrfCookie = readCookie(request.headers.get("cookie"), "g_csrf_token");
    if (typeof credential !== "string" || typeof csrfBody !== "string" || !csrfCookie || csrfCookie !== csrfBody) {
      throw new Error("csrf_failed");
    }

    const identity = await verifyGoogleCredential(credential);
    const token = await createStudioSessionToken(identity);
    return studioRedirect(request, "/studio", studioSessionCookie(request, token));
  } catch (caught) {
    if (caught instanceof Error && caught.message === "account_not_allowed") error = "not-allowed";
    if (caught instanceof Error && caught.message === "studio_not_configured") error = "configuration";
    console.error("[studio-session]", caught instanceof Error ? caught.message : "unknown_error");
  }

  return studioRedirect(request, `/studio?error=${error}`, expiredStudioSessionCookie(request));
}

function studioRedirect(request: Request, pathname: string, cookie?: string) {
  const headers = new Headers({
    Location: new URL(pathname, request.url).toString(),
    "Cache-Control": "no-store",
  });
  if (cookie) headers.set("Set-Cookie", cookie);
  return new Response(null, { status: 303, headers });
}
