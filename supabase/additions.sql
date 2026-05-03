-- ============================================================
-- EliteMatch — Schema Additions
-- Run this in the Supabase SQL editor after the main schema
-- ============================================================

-- Admin flag on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Let a user see swipes where THEY are the target (powers "Likes Received" page)
CREATE POLICY IF NOT EXISTS "read received swipes" ON public.swipes
  FOR SELECT USING (swiped_id = auth.uid());

-- Mark your own email as admin (replace with your email)
UPDATE public.profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'maromtamir@gmail.com'
);
