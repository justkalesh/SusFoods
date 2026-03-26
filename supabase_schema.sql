-- ╔════════════════════════════════════════════════════════════╗
-- ║  SuS-Food 2.0 — Production Database Schema               ║
-- ╚════════════════════════════════════════════════════════════╝

-- ── 1. Profiles Table (extends auth.users) ────────────────────
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role TEXT CHECK (role IN ('business', 'ngo')) NOT NULL,
    name TEXT,
    organization_name TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

CREATE POLICY "Users can insert own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );


-- ── 2. Auth Trigger: Auto-create profile on signup ────────────
-- This function fires after a new user is inserted into auth.users.
-- It reads raw_user_meta_data to populate the profile row.
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

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ── 3. Food Items Table ───────────────────────────────────────
CREATE TABLE public.food_items (
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

CREATE POLICY "Food items are viewable by everyone."
  ON public.food_items FOR SELECT
  USING ( true );

CREATE POLICY "Businesses can insert own food items."
  ON public.food_items FOR INSERT
  WITH CHECK ( auth.uid() = donor_id );

CREATE POLICY "Businesses can update own food items."
  ON public.food_items FOR UPDATE
  USING ( auth.uid() = donor_id );

-- Enable Realtime for food_items so NGO dashboard gets live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.food_items;


-- ── 4. SOS Appeals Table ──────────────────────────────────────
CREATE TABLE public.sos_appeals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ngo_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    request_text TEXT NOT NULL,
    urgency TEXT NOT NULL CHECK (urgency IN ('High', 'Medium', 'Low')),
    date_posted TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.sos_appeals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SOS appeals are viewable by everyone."
  ON public.sos_appeals FOR SELECT
  USING ( true );

CREATE POLICY "NGOs can insert own appeals."
  ON public.sos_appeals FOR INSERT
  WITH CHECK ( auth.uid() = ngo_id );

CREATE POLICY "NGOs can update own appeals."
  ON public.sos_appeals FOR UPDATE
  USING ( auth.uid() = ngo_id );


-- ── 5. Claims Table ──────────────────────────────────────────
CREATE TABLE public.claims (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
    ngo_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Transit', 'Received')) NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view claims involving them."
  ON public.claims FOR SELECT
  USING ( auth.uid() = ngo_id OR auth.uid() IN (SELECT donor_id FROM public.food_items WHERE id = food_item_id) );

CREATE POLICY "NGOs can insert claims."
  ON public.claims FOR INSERT
  WITH CHECK ( auth.uid() = ngo_id );

CREATE POLICY "Claim participants can update the claim."
  ON public.claims FOR UPDATE
  USING ( auth.uid() = ngo_id OR auth.uid() IN (SELECT donor_id FROM public.food_items WHERE id = food_item_id) );
