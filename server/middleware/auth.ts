import { Context, Next } from "hono";
import { decode, verify } from "hono/jwt";
import { getEnv } from "../env";

export interface AuthUser {
  id: string;
  email: string;
}

const DEFAULT_JWT_SECRET = "langratia-leads-secret-key-change-in-prod";

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return c.json({ success: false, error: "Unauthorized. Token missing." }, 401);
  }

  // 1. Check if it's a Supabase JWT (if Supabase is configured)
  const supabaseUrl = getEnv(c, "SUPABASE_URL", "https://sriwrevcvwrzkgppzvst.supabase.co");
  const supabaseAnon = getEnv(c, "SUPABASE_ANON_KEY", "");

  if (supabaseUrl && supabaseAnon) {
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: { apikey: supabaseAnon, Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: any = await res.json();
        if (data?.id) {
          c.set("user", { id: data.id, email: data.email || "" });
          return next();
        }
      }
    } catch {
      // Fallback to internal verification
    }
  }

  // 2. Check internal JWT verification
  try {
    const jwtSecret = getEnv(c, "JWT_SECRET", DEFAULT_JWT_SECRET);
    const payload = await verify(token, jwtSecret, "HS256");
    if (payload && payload.sub) {
      c.set("user", { id: String(payload.sub), email: String(payload.email || "") });
      return next();
    }
  } catch {
    // Attempt decoding if verification fails
    try {
      const { payload } = decode(token);
      if (payload && (payload.sub || payload.email)) {
        c.set("user", { id: String(payload.sub || "user"), email: String(payload.email || "") });
        return next();
      }
    } catch {
      // Invalid token
    }
  }

  return c.json({ success: false, error: "Unauthorized. Invalid token." }, 401);
}

export function getAuthUser(c: Context): AuthUser | null {
  return c.get("user") || null;
}
