import { createClient } from "@supabase/supabase-js";

const hasProcessEnv = typeof process !== "undefined" && !!process.env;

const supabaseUrl =
  (hasProcessEnv && process.env.NEXT_PUBLIC_SUPABASE_URL) ||
  "https://sriwrevcvwrzkgppzvst.supabase.co";

const supabaseAnonKey =
  (hasProcessEnv && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaXdyZXZjdndyemtncHB6dnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MjE4NTcsImV4cCI6MjEwMjE5Nzg1N30.jsBudnBdVjhGGqyd9HxBHuepjnqo_lD7H9uwtyjkHX8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
