import { createClient } from "@supabase/supabase-js";

const hasProcessEnv = typeof process !== "undefined" && !!process.env;
const metaEnv = typeof import.meta !== "undefined" ? (import.meta as any).env : undefined;

const supabaseUrl =
  metaEnv?.VITE_SUPABASE_URL ||
  (hasProcessEnv && (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL)) ||
  "https://sriwrevcvwrzkgppzvst.supabase.co";

const supabaseAnonKey =
  metaEnv?.VITE_SUPABASE_ANON_KEY ||
  (hasProcessEnv && (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY)) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaXdyZXZjdndyemtncHB6dnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MjE4NTcsImV4cCI6MjEwMjE5Nzg1N30.jsBudnBdVjhGGqyd9HxBHuepjnqo_lD7H9uwtyjkHX8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
