import { createRemoteJWKSet, jwtVerify } from "jose";
import { getRuntimeEnv } from "./runtime";

type HeaderReader = Pick<Headers, "get">;

let cachedJwksUrl = "";
let cachedJwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function normalizeHost(value: string | null) {
  return (value ?? "")
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");
}

function normalizeTeamDomain(value: string | undefined) {
  const domain = (value ?? "").trim().replace(/\/+$/, "");
  if (!domain) return "";
  return /^https:\/\//i.test(domain) ? domain : `https://${domain}`;
}

function allowedEditorEmails(value: string | undefined) {
  return new Set(
    (value ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function accessJwks(teamDomain: string) {
  const url = `${teamDomain}/cdn-cgi/access/certs`;
  if (!cachedJwks || cachedJwksUrl !== url) {
    cachedJwksUrl = url;
    cachedJwks = createRemoteJWKSet(new URL(url));
  }
  return cachedJwks;
}

/**
 * Fail-closed gateway for every studio page and API route.
 * The exact private host and Cloudflare Access token must both be valid.
 */
export async function hasStudioGatewayAccess(headers: HeaderReader) {
  const runtime = getRuntimeEnv();
  const expectedHost = normalizeHost(runtime.STUDIO_HOST ?? null);
  const actualHost = normalizeHost(headers.get("x-forwarded-host") ?? headers.get("host"));
  const teamDomain = normalizeTeamDomain(runtime.CF_ACCESS_TEAM_DOMAIN);
  const audience = (runtime.CF_ACCESS_AUD ?? "").trim();
  const token = headers.get("cf-access-jwt-assertion")?.trim() ?? "";
  const allowedEmails = allowedEditorEmails(runtime.EDITOR_ALLOWED_EMAILS);

  if (!expectedHost || actualHost !== expectedHost || !teamDomain || !audience || !token || allowedEmails.size === 0) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(token, accessJwks(teamDomain), {
      issuer: teamDomain,
      audience,
      algorithms: ["RS256"],
    });
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    return Boolean(email && allowedEmails.has(email));
  } catch {
    return false;
  }
}

export function studioNotFoundResponse() {
  return new Response("Not Found", {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });
}
