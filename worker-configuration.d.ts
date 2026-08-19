declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    MEDIA: R2Bucket;
    GOOGLE_CLIENT_ID?: string;
    EDITOR_ALLOWED_EMAILS?: string;
    SESSION_SECRET?: string;
  }
}
