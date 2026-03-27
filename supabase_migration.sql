-- ╔════════════════════════════════════════════════════════════╗
-- ║  SuS-Food 2.0 — Migration (run ONCE on existing DB)      ║
-- ║  Safe to re-run: uses IF NOT EXISTS / OR REPLACE          ║
-- ╚════════════════════════════════════════════════════════════╝

-- 1. Add latitude/longitude to profiles (if missing)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- 2. Auth trigger: auto-create profile row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name, organization_name)
  VALUES (
    NEW.id,
    CASE
      WHEN (NEW.raw_user_meta_data ->> 'role') = 'ngo' THEN 'ngo'
      ELSE 'business'
    END,
    COALESCE(
      TRIM(
        COALESCE(NEW.raw_user_meta_data ->> 'first_name', '') || ' ' ||
        COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
      ),
      'User'
    ),
    NEW.raw_user_meta_data ->> 'organization_name'
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any, then re-create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Ensure food_items table exists
CREATE TABLE IF NOT EXISTS public.food_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    donor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Produce', 'Bakery', 'Prepared Meals', 'Dairy', 'Other')),
    quantity_kg NUMERIC NOT NULL,
    safe_to_consume_until TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Claimed', 'In Transit', 'Delivered')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Food items are viewable by everyone." ON public.food_items;
CREATE POLICY "Food items are viewable by everyone." ON public.food_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Businesses can insert own food items." ON public.food_items;
CREATE POLICY "Businesses can insert own food items." ON public.food_items FOR INSERT WITH CHECK (auth.uid() = donor_id);
DROP POLICY IF EXISTS "Businesses can update own food items." ON public.food_items;
CREATE POLICY "Businesses can update own food items." ON public.food_items FOR UPDATE USING (auth.uid() = donor_id);

-- 4. Enable Realtime on food_items (ignore error if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.food_items;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- 5. Ensure claims table exists
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
    ngo_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Transit', 'Received')) NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view claims involving them." ON public.claims;
CREATE POLICY "Users can view claims involving them." ON public.claims FOR SELECT
  USING (auth.uid() = ngo_id OR auth.uid() IN (SELECT donor_id FROM public.food_items WHERE id = food_item_id));
DROP POLICY IF EXISTS "NGOs can insert claims." ON public.claims;
CREATE POLICY "NGOs can insert claims." ON public.claims FOR INSERT WITH CHECK (auth.uid() = ngo_id);
DROP POLICY IF EXISTS "Claim participants can update." ON public.claims;
CREATE POLICY "Claim participants can update." ON public.claims FOR UPDATE
  USING (auth.uid() = ngo_id OR auth.uid() IN (SELECT donor_id FROM public.food_items WHERE id = food_item_id));

-- 6. Ensure sos_appeals table exists
CREATE TABLE IF NOT EXISTS public.sos_appeals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ngo_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    request_text TEXT NOT NULL,
    urgency TEXT NOT NULL CHECK (urgency IN ('High', 'Medium', 'Low')),
    date_posted TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.sos_appeals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "SOS appeals are viewable by everyone." ON public.sos_appeals;
CREATE POLICY "SOS appeals are viewable by everyone." ON public.sos_appeals FOR SELECT USING (true);
DROP POLICY IF EXISTS "NGOs can insert own appeals." ON public.sos_appeals;
CREATE POLICY "NGOs can insert own appeals." ON public.sos_appeals FOR INSERT WITH CHECK (auth.uid() = ngo_id);
DROP POLICY IF EXISTS "NGOs can update own appeals." ON public.sos_appeals;
CREATE POLICY "NGOs can update own appeals." ON public.sos_appeals FOR UPDATE USING (auth.uid() = ngo_id);

-- 7. Ensure organizations table has proper RLS for authenticated inserts
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own organization." ON public.organizations;
CREATE POLICY "Users can view own organization." ON public.organizations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own organization." ON public.organizations;
CREATE POLICY "Users can insert own organization." ON public.organizations FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own organization." ON public.organizations;
CREATE POLICY "Users can update own organization." ON public.organizations FOR UPDATE USING (auth.uid() = user_id);
