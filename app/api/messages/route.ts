import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { match_id, content } = await req.json();
  if (!match_id || !content?.trim()) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Verify user is part of this match
  const { data: match } = await supabase
    .from("matches")
    .select("id")
    .eq("id", match_id)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .single();

  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const { data, error } = await supabase.from("messages").insert({
    match_id,
    sender_id: user.id,
    content: content.trim(),
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
