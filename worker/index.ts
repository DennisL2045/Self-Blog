/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const response = await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
      return withSecurityHeaders(request, response);
    }

    const response = withSecurityHeaders(request, await handler.fetch(request, env, ctx));
    if (!isCacheablePublicDocument(request) || response.status !== 200 || response.headers.has("Set-Cookie")) return response;

    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};

function isCacheablePublicDocument(request: Request) {
  if (request.method !== "GET" || request.headers.get("RSC") === "1") return false;
  const pathname = new URL(request.url).pathname;
  if (pathname === "/studio" || pathname.startsWith("/api/") || pathname.startsWith("/media/") || pathname.startsWith("/_next/")) return false;
  return request.headers.get("Accept")?.includes("text/html") ?? false;
}

const PUBLIC_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "script-src-attr 'none'",
  "connect-src 'self'",
  "frame-src 'none'",
  "media-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
].join("; ");

const STUDIO_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline' https://accounts.google.com",
  "script-src 'self' 'unsafe-inline' https://accounts.google.com",
  "script-src-attr 'none'",
  "connect-src 'self' https://accounts.google.com",
  "frame-src https://accounts.google.com",
  "media-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
].join("; ");

function withSecurityHeaders(request: Request, response: Response) {
  const headers = new Headers(response.headers);
  const requestUrl = new URL(request.url);
  const pathname = requestUrl.pathname;
  const studioSurface = pathname === "/studio" || pathname.startsWith("/api/studio/");
  const contentSecurityPolicy = studioSurface ? STUDIO_CONTENT_SECURITY_POLICY : PUBLIC_CONTENT_SECURITY_POLICY;
  headers.set("Content-Security-Policy", requestUrl.protocol === "https:" ? `${contentSecurityPolicy}; upgrade-insecure-requests` : contentSecurityPolicy);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Permitted-Cross-Domain-Policies", "none");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Cross-Origin-Opener-Policy", studioSurface ? "same-origin-allow-popups" : "same-origin");
  headers.set("Origin-Agent-Cluster", "?1");
  if (requestUrl.protocol === "https:") {
    headers.set("Strict-Transport-Security", "max-age=31536000");
  }
  if (studioSurface) {
    headers.set("Cache-Control", "private, no-store");
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default worker;
