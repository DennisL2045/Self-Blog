import {
  createStudioSessionToken,
  readCookie,
  studioSessionCookie,
  verifyGoogleCredential,
} from "../../../lib/studio-auth";

export async function POST(request: Request) {
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
    const response = Response.redirect(new URL("/studio", request.url), 303);
    response.headers.set("Set-Cookie", studioSessionCookie(request, token));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (caught) {
    if (caught instanceof Error && caught.message === "account_not_allowed") error = "not-allowed";
    if (caught instanceof Error && caught.message === "studio_not_configured") error = "configuration";
  }

  const response = Response.redirect(new URL(`/studio?error=${error}`, request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
