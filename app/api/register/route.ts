import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const { email, password, profile } = await req.json();

  // Create auth user
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip email confirmation
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? "Sign-up failed" }, { status: 400 });
  }

  // Insert profile using service role (bypasses RLS)
  const { error: profileError } = await adminClient.from("profiles").insert({
    id: authData.user.id,
    ...profile,
  });

  if (profileError) {
    // Roll back the auth user if profile insert fails
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
