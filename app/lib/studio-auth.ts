import { headers } from "next/headers";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import { getRuntimeEnv } from "./runtime";

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const SESSION_COOKIE = "night_notes_studio";
const SESSION_ISSUER = "night-notes-studio";
const SESSION_AUDIENCE = "night-notes-editor";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

export type StudioIdentity = {
  googleSub: string;
  email: string;
  name: string;
};

export type StudioSession = StudioIdentity & {
  expiresAt: number;
};

export function getStudioConfiguration() {
  const runtime = getRuntimeEnv();
  const clientId = runtime.GOOGLE_CLIENT_ID?.trim() ?? "";
  const sessionSecret = runtime.SESSION_SECRET?.trim() ?? "";
  const allowedEmails = new Set(
    (runtime.EDITOR_ALLOWED_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLocaleLowerCase("en-US"))
      .filter(Boolean),
  );

  return {
    clientId,
    sessionSecret,
    allowedEmails,
    ready: Boolean(clientId && sessionSecret.length >= 32 && allowedEmails.size >= 1),
  };
}

export async function verifyGoogleCredential(credential: string): Promise<StudioIdentity> {
  const config = getStudioConfiguration();
  if (!config.ready) throw new Error("studio_not_configured");

  const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
    audience: config.clientId,
    issuer: ["accounts.google.com", "https://accounts.google.com"],
    algorithms: ["RS256"],
  });

  const email = typeof payload.email === "string" ? payload.email.toLocaleLowerCase("en-US") : "";
  const isGoogleAuthoritative = email.endsWith("@gmail.com") || typeof payload.hd === "string";
  if (!payload.sub || !email || payload.email_verified !== true || !isGoogleAuthoritative) {
    throw new Error("google_identity_not_authoritative");
  }
  if (!config.allowedEmails.has(email)) throw new Error("account_not_allowed");

  return {
    googleSub: payload.sub,
    email,
    name: typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : email,
  };
}

export async function createStudioSessionToken(session: StudioIdentity): Promise<string> {
  const { sessionSecret } = getStudioConfiguration();
  if (sessionSecret.length < 32) throw new Error("studio_not_configured");

  return new SignJWT({ email: session.email, name: session.name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(session.googleSub)
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(new TextEncoder().encode(sessionSecret));
}

export async function readStudioSessionToken(token?: string | null): Promise<StudioSession | null> {
  if (!token) return null;
  const config = getStudioConfiguration();
  if (!config.ready) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(config.sessionSecret), {
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
      algorithms: ["HS256"],
    });
    const email = typeof payload.email === "string" ? payload.email.toLocaleLowerCase("en-US") : "";
    if (!payload.sub || !email || !config.allowedEmails.has(email) || typeof payload.exp !== "number") return null;
    return {
      googleSub: payload.sub,
      email,
      name: typeof payload.name === "string" && payload.name ? payload.name : email,
      expiresAt: payload.exp * 1000,
    };
  } catch {
    return null;
  }
}

export async function getStudioSession(): Promise<StudioSession | null> {
  const requestHeaders = await headers();
  return readStudioSessionToken(readCookie(requestHeaders.get("cookie"), SESSION_COOKIE));
}

export async function getStudioSessionFromRequest(request: Request): Promise<StudioSession | null> {
  return readStudioSessionToken(readCookie(request.headers.get("cookie"), SESSION_COOKIE));
}

export function studioSessionCookie(request: Request, token: string): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DURATION_SECONDS}${secure}`;
}

export function expiredStudioSessionCookie(request: Request): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

export function isSameOriginMutation(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
