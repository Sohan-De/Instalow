-- Add admin column to profiles table
-- Run this in your Supabase SQL Editor

-- Add admin column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN admin BOOLEAN DEFAULT false;

-- Update existing RLS policies to handle admin access
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can manage all profiles" ON public.profiles;

-- Create new policies that include admin functionality
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admin policy - admins can view and manage all profiles
CREATE POLICY "Admin can manage all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND admin = true
        )
    );

-- Create index for better performance on admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON public.profiles(admin);

-- Grant necessary permissions
GRANT ALL ON public.profiles TO anon, authenticated;

-- Optional: Set specific users as admin (replace with actual admin user IDs)
-- UPDATE public.profiles SET admin = true WHERE email = 'admin@instalow.com';
-- UPDATE public.profiles SET admin = true WHERE email = 'your-admin-email@domain.com';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'admin';
