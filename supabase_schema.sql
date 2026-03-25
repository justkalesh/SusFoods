-- Create a table for public profiles (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role TEXT CHECK (role IN ('business', 'ngo')) NOT NULL,
    name TEXT,
    organization_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to profiles
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

-- Allow users to update their own profiles
CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );


-- Create a table for Food Items (donations)
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

-- Enable RLS on food items
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to food items
CREATE POLICY "Food items are viewable by everyone."
  ON public.food_items FOR SELECT
  USING ( true );

-- Allow authenticated businesses to insert their own food items
CREATE POLICY "Businesses can insert own food items."
  ON public.food_items FOR INSERT
  WITH CHECK ( auth.uid() = donor_id );

-- Allow businesses to update their own food items
CREATE POLICY "Businesses can update own food items."
  ON public.food_items FOR UPDATE
  USING ( auth.uid() = donor_id );


-- Create a table for SOS Appeals (NGO requests)
CREATE TABLE public.sos_appeals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ngo_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    request_text TEXT NOT NULL,
    urgency TEXT NOT NULL CHECK (urgency IN ('High', 'Medium', 'Low')),
    date_posted TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on sos appeals
ALTER TABLE public.sos_appeals ENABLE ROW LEVEL SECURITY;

-- Allow public read access to SOS appeals
CREATE POLICY "SOS appeals are viewable by everyone."
  ON public.sos_appeals FOR SELECT
  USING ( true );

-- Allow authenticated NGOs to insert their own appeals
CREATE POLICY "NGOs can insert own appeals."
  ON public.sos_appeals FOR INSERT
  WITH CHECK ( auth.uid() = ngo_id );

-- Allow NGOs to update their own appeals
CREATE POLICY "NGOs can update own appeals."
  ON public.sos_appeals FOR UPDATE
  USING ( auth.uid() = ngo_id );


-- Create a table for Food Item Claims
CREATE TABLE public.claims (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
    ngo_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Transit', 'Received')) NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on claims
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Allow users to view claims involving them
CREATE POLICY "Users can view claims involving them."
  ON public.claims FOR SELECT
  USING ( auth.uid() = ngo_id OR auth.uid() IN (SELECT donor_id FROM public.food_items WHERE id = food_item_id) );

-- Allow authenticated NGOs to insert claims
CREATE POLICY "NGOs can insert claims."
  ON public.claims FOR INSERT
  WITH CHECK ( auth.uid() = ngo_id );

-- Allow both the NGO and Donor to update the claim status
CREATE POLICY "Claim participants can update the claim."
  ON public.claims FOR UPDATE
  USING ( auth.uid() = ngo_id OR auth.uid() IN (SELECT donor_id FROM public.food_items WHERE id = food_item_id) );
