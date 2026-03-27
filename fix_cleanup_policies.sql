-- Clean up old duplicate policies (exact names from your database)
DROP POLICY IF EXISTS "Users can view their own organization." ON public.organizations;
DROP POLICY IF EXISTS "Users can insert their own organization." ON public.organizations;
DROP POLICY IF EXISTS "Users can update their own organization." ON public.organizations;

-- Verify: should show exactly 3 policies now
SELECT policyname, cmd, roles, qual FROM pg_policies WHERE tablename = 'organizations';
