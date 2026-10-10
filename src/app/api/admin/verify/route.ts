
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const adminEmail =
    process.env.DEALSTACK_ADMIN_EMAIL?.trim().toLowerCase();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!adminEmail || !supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { authorized: false, error: "Server configuration missing" },
      { status: 500 }
    );
  }

  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer (.+)$/i)?.[1];

  if (!token) {
    return NextResponse.json(
      { authorized: false },
      { status: 401 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return NextResponse.json(
      { authorized: false },
      { status: 401 }
    );
  }

  const userEmail = data.user.email?.trim().toLowerCase();

  if (userEmail !== adminEmail) {
    return NextResponse.json(
      { authorized: false },
      { status: 403 }
    );
  }

  return NextResponse.json(
    { authorized: true },
    { headers: { "Cache-Control": "no-store" } }
  );
}
