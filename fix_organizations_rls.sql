-- ╔════════════════════════════════════════════════════════════╗
-- ║  SuS-Food 2.0 — FIX: Organizations table RLS policies    ║
-- ║  Run this in your Supabase SQL Editor NOW                 ║
-- ╚════════════════════════════════════════════════════════════╝

-- First, check if the organizations table exists and inspect it
-- If this errors, the table doesn't exist at all and needs creating.

-- Step 1: Ensure the organizations table exists with all columns
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT,
    legal_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    country TEXT,
    suite_number TEXT,
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 2: Add any columns that might be missing (safe for existing table)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='organizations' AND column_name='latitude') THEN
    ALTER TABLE public.organizations ADD COLUMN latitude NUMERIC;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='organizations' AND column_name='longitude') THEN
    ALTER TABLE public.organizations ADD COLUMN longitude NUMERIC;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='organizations' AND column_name='country') THEN
    ALTER TABLE public.organizations ADD COLUMN country TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='organizations' AND column_name='suite_number') THEN
    ALTER TABLE public.organizations ADD COLUMN suite_number TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='organizations' AND column_name='type') THEN
    ALTER TABLE public.organizations ADD COLUMN type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='organizations' AND column_name='legal_name') THEN
    ALTER TABLE public.organizations ADD COLUMN legal_name TEXT;
  END IF;
END $$;

-- Step 3: Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Step 4: DROP all existing policies to start fresh (prevents conflicts)
DROP POLICY IF EXISTS "Users can view own organization." ON public.organizations;
DROP POLICY IF EXISTS "Users can insert own organization." ON public.organizations;
DROP POLICY IF EXISTS "Users can update own organization." ON public.organizations;
DROP POLICY IF EXISTS "Organizations are viewable by everyone" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can insert own organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can update own organization" ON public.organizations;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.organizations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.organizations;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.organizations;

-- Step 5: Create SIMPLE, PERMISSIVE policies
-- SELECT: anyone can read (needed for map, profiles, feed)
CREATE POLICY "Organizations are viewable by everyone"
  ON public.organizations FOR SELECT
  USING (true);

-- INSERT: any authenticated user can insert their own row
CREATE POLICY "Authenticated users can insert own organization"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: users can update their own row
CREATE POLICY "Users can update own organization"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 6: Verify — this should return the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'organizations';
