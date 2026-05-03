import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { swiped_id, action } = await req.json();
  if (!swiped_id || !["like", "pass", "super_like"].includes(action)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { error } = await supabase.from("swipes").insert({
    swiper_id: user.id,
    swiped_id,
    action,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Check if it became a match
  const { data: match } = await supabase
    .from("matches")
    .select("id")
    .or(
      `and(user1_id.eq.${user.id},user2_id.eq.${swiped_id}),and(user1_id.eq.${swiped_id},user2_id.eq.${user.id})`
    )
    .single();

  return NextResponse.json({ matched: !!match, match_id: match?.id ?? null });
}
