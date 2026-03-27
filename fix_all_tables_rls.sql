-- ╔════════════════════════════════════════════════════════════╗
-- ║  SuS-Food 2.0 — Fix food_items and claims RLS            ║
-- ║  Run this in Supabase SQL Editor                          ║
-- ╚════════════════════════════════════════════════════════════╝

-- ═══ FOOD_ITEMS TABLE ═══
CREATE TABLE IF NOT EXISTS public.food_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category TEXT,
    quantity_kg NUMERIC DEFAULT 0,
    safe_to_consume_until TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

-- Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "Food items are viewable by everyone" ON public.food_items;
DROP POLICY IF EXISTS "Authenticated users can insert food items" ON public.food_items;
DROP POLICY IF EXISTS "Users can update own food items" ON public.food_items;

-- Fresh policies
CREATE POLICY "Food items are viewable by everyone"
  ON public.food_items FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert food items"
  ON public.food_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Users can update own food items"
  ON public.food_items FOR UPDATE TO authenticated
  USING (auth.uid() = donor_id);


-- ═══ CLAIMS TABLE ═══
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE,
    ngo_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Pending',
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Claims are viewable by everyone" ON public.claims;
DROP POLICY IF EXISTS "Authenticated users can insert claims" ON public.claims;
DROP POLICY IF EXISTS "Users can update claims" ON public.claims;

CREATE POLICY "Claims are viewable by everyone"
  ON public.claims FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert claims"
  ON public.claims FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = ngo_id);

CREATE POLICY "Users can update claims"
  ON public.claims FOR UPDATE TO authenticated
  USING (true);


-- ═══ VERIFY ALL TABLES ═══
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('food_items', 'claims', 'organizations')
ORDER BY tablename, cmd;
