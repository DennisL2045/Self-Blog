import { env } from "cloudflare:workers";

export type SiteRuntimeEnv = {
  DB?: D1Database;
  MEDIA?: R2Bucket;
  IMAGES?: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
  GOOGLE_CLIENT_ID?: string;
  EDITOR_ALLOWED_EMAILS?: string;
  SESSION_SECRET?: string;
};

export function getRuntimeEnv(): SiteRuntimeEnv {
  return env as unknown as SiteRuntimeEnv;
}

export function getD1(): D1Database {
  const database = getRuntimeEnv().DB;
  if (!database) throw new Error("D1 binding DB is unavailable");
  return database;
}

export function getMediaBucket(): R2Bucket {
  const bucket = getRuntimeEnv().MEDIA;
  if (!bucket) throw new Error("R2 binding MEDIA is unavailable");
  return bucket;
}

export function getImageTransformer() {
  const images = getRuntimeEnv().IMAGES;
  if (!images) throw new Error("Image transformation service is unavailable");
  return images;
}
