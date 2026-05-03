-- ============================================================
-- EliteMatch — Supabase Schema
-- Run this in the Supabase SQL editor (supabase.com → your project → SQL)
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── Profiles ────────────────────────────────────────────────
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  full_name           text not null,
  display_name        text not null,
  birth_date          date not null,
  gender              text not null check (gender in ('man','woman','non_binary','prefer_not_to_say')),
  seeking             text[] not null default '{}',
  location            text not null,
  occupation          text not null,
  company             text,
  wealth_tier         text not null check (wealth_tier in ('affluent','hnw','uhnw','uuhnw')),
  net_worth_range     text not null,
  verified            boolean not null default false,
  verification_status text not null default 'pending'
                        check (verification_status in ('pending','in_review','verified','rejected')),
  bio                 text,
  interests           text[] not null default '{}',
  lifestyle           text[] not null default '{}',
  looking_for         text,
  avatar_url          text,
  photos              text[] not null default '{}',
  is_premium          boolean not null default false,
  last_active         timestamptz,
  created_at          timestamptz not null default now()
);

-- Auto-update last_active on any profile change
create or replace function public.touch_last_active()
returns trigger language plpgsql as $$
begin
  new.last_active = now();
  return new;
end;
$$;

create trigger trg_touch_last_active
  before update on public.profiles
  for each row execute procedure public.touch_last_active();

-- ── Swipes ──────────────────────────────────────────────────
create table public.swipes (
  id          uuid primary key default gen_random_uuid(),
  swiper_id   uuid not null references public.profiles(id) on delete cascade,
  swiped_id   uuid not null references public.profiles(id) on delete cascade,
  action      text not null check (action in ('like','pass','super_like')),
  created_at  timestamptz not null default now(),
  unique (swiper_id, swiped_id)
);

-- ── Matches ─────────────────────────────────────────────────
create table public.matches (
  id          uuid primary key default gen_random_uuid(),
  user1_id    uuid not null references public.profiles(id) on delete cascade,
  user2_id    uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user1_id, user2_id)
);

-- Auto-create match when both users like each other
create or replace function public.check_mutual_like()
returns trigger language plpgsql as $$
declare
  mutual boolean;
begin
  if new.action not in ('like','super_like') then
    return new;
  end if;

  select exists (
    select 1 from public.swipes
    where swiper_id = new.swiped_id
      and swiped_id = new.swiper_id
      and action in ('like','super_like')
  ) into mutual;

  if mutual then
    insert into public.matches (user1_id, user2_id)
    values (least(new.swiper_id, new.swiped_id), greatest(new.swiper_id, new.swiped_id))
    on conflict do nothing;
  end if;

  return new;
end;
$$;

create trigger trg_check_mutual_like
  after insert on public.swipes
  for each row execute procedure public.check_mutual_like();

-- ── Messages ────────────────────────────────────────────────
create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid not null references public.matches(id) on delete cascade,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- ── Verification requests ────────────────────────────────────
create table public.verification_requests (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  document_urls   text[] not null default '{}',
  notes           text,
  reviewed_by     uuid references auth.users(id),
  reviewed_at     timestamptz,
  status          text not null default 'pending'
                    check (status in ('pending','in_review','approved','rejected')),
  created_at      timestamptz not null default now()
);

-- ── Storage bucket ───────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict do nothing;

-- ── Row Level Security ───────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.verification_requests enable row level security;

-- profiles: anyone can read verified profiles; only owner can write
create policy "read verified profiles" on public.profiles
  for select using (verification_status = 'verified' or id = auth.uid());

create policy "owner update profile" on public.profiles
  for update using (id = auth.uid());

create policy "owner insert profile" on public.profiles
  for insert with check (id = auth.uid());

-- swipes: only owner
create policy "own swipes" on public.swipes
  for all using (swiper_id = auth.uid());

-- matches: participants only
create policy "own matches" on public.matches
  for select using (user1_id = auth.uid() or user2_id = auth.uid());

-- messages: match participants only
create policy "match messages" on public.messages
  for all using (
    exists (
      select 1 from public.matches m
      where m.id = match_id
        and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );

-- verification requests: owner insert/read; admin full access
create policy "own verification requests" on public.verification_requests
  for all using (profile_id = auth.uid());

-- ── Indexes ──────────────────────────────────────────────────
create index idx_swipes_swiped on public.swipes(swiped_id);
create index idx_swipes_swiper on public.swipes(swiper_id);
create index idx_matches_user1 on public.matches(user1_id);
create index idx_matches_user2 on public.matches(user2_id);
create index idx_messages_match on public.messages(match_id, created_at desc);
create index idx_profiles_wealth on public.profiles(wealth_tier, verification_status);
