import type { Context } from "hono";

export function getEnv(c?: Context, key?: string, fallback = ""): string {
  if (!key) return fallback;
  if (c && c.env && typeof c.env === "object") {
    const val = (c.env as Record<string, any>)[key];
    if (typeof val === "string" && val.length > 0) {
      return val;
    }
  }
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key]!;
  }
  return fallback;
}
