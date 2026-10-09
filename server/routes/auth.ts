import { Hono } from "hono";
import { sign } from "hono/jwt";
import { authMiddleware, getAuthUser } from "../middleware/auth";
import { getEnv } from "../env";

export const authRouter = new Hono();

const DEFAULT_JWT_SECRET = "langratia-leads-secret-key-change-in-prod";
const DEFAULT_SUPABASE_URL = "https://sriwrevcvwrzkgppzvst.supabase.co";
const DEFAULT_ANON_KEY = "";

authRouter.post("/login", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ success: false, error: "Email and password are required." }, 400);
  }

  const jwtSecret = getEnv(c, "JWT_SECRET", DEFAULT_JWT_SECRET);

  // 1. Check staff admin credentials
  const defaultAdminEmail = getEnv(c, "ADMIN_EMAIL") || getEnv(c, "VITE_DEFAULT_USER_EMAIL", "sales@langratia.com");
  const defaultAdminPass = getEnv(c, "ADMIN_PASSWORD", "langratia123");

  if (email.toLowerCase() === defaultAdminEmail.toLowerCase() && password === defaultAdminPass) {
    const token = await sign(
      {
        sub: "admin-user",
        email: defaultAdminEmail,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
      },
      jwtSecret,
      "HS256"
    );

    return c.json({
      success: true,
      accessToken: token,
      user: {
        id: "admin-user",
        email: defaultAdminEmail,
      },
    });
  }

  // 2. Try authenticating via Supabase Auth server-side
  const supabaseUrl = getEnv(c, "SUPABASE_URL", DEFAULT_SUPABASE_URL);
  const anonKey = getEnv(c, "SUPABASE_ANON_KEY", DEFAULT_ANON_KEY);

  if (supabaseUrl && anonKey) {
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          apikey: anonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data: any = await res.json();
      if (res.ok && data.access_token) {
        return c.json({
          success: true,
          accessToken: data.access_token,
          user: {
            id: data.user?.id || "user",
            email: data.user?.email || email,
          },
        });
      }

      if (data?.error_description || data?.msg) {
        return c.json(
          { success: false, error: data.error_description || data.msg },
          res.status >= 400 && res.status < 500 ? (res.status as any) : 401
        );
      }
    } catch {
      // Fall through
    }
  }

  return c.json({ success: false, error: "Invalid credentials. Access denied." }, 401);
});

authRouter.get("/me", authMiddleware, async (c) => {
  const user = getAuthUser(c);
  return c.json({ success: true, user });
});

authRouter.post("/logout", async (c) => {
  return c.json({ success: true, message: "Logged out successfully" });
});
