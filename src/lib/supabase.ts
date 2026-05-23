import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase =
  globalThis.supabase ??
  createClient(
    supabaseUrl,
    supabaseAnonKey
  );

if (process.env.NODE_ENV !== "production") {

  // @ts-ignore
  globalThis.supabase = supabase;
}