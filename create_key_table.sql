-- Create Key Table for Instaflow
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the key table
CREATE TABLE IF NOT EXISTS public.keys (
    key_id SERIAL PRIMARY KEY,
    key_value TEXT NOT NULL UNIQUE,
    marked_as_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin can manage all keys" ON public.keys;
DROP POLICY IF EXISTS "Users can view keys" ON public.keys;

-- Create RLS policies
-- Admin can manage all keys
CREATE POLICY "Admin can manage all keys" ON public.keys
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE email IN ('admin@instalow.com', 'your-admin-email@domain.com')
        )
    );

-- Users can view keys (but not modify them)
CREATE POLICY "Users can view keys" ON public.keys
    FOR SELECT USING (true);

-- Drop existing indexes to avoid conflicts
DROP INDEX IF EXISTS idx_keys_key_value;
DROP INDEX IF EXISTS idx_keys_marked_as_used;
DROP INDEX IF EXISTS idx_keys_created_at;

-- Create indexes for better performance
CREATE INDEX idx_keys_key_value ON public.keys(key_value);
CREATE INDEX idx_keys_marked_as_used ON public.keys(marked_as_used);
CREATE INDEX idx_keys_created_at ON public.keys(created_at);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger to avoid conflicts
DROP TRIGGER IF EXISTS update_keys_updated_at ON public.keys;

CREATE TRIGGER update_keys_updated_at BEFORE UPDATE ON public.keys
    FOR EACH ROW EXECUTE FUNCTION update_keys_updated_at();

-- Function to generate 16-digit alphanumeric keys
CREATE OR REPLACE FUNCTION generate_alphanumeric_key(length INTEGER DEFAULT 16)
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars))::integer + 1, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.keys TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_keys_updated_at() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION generate_alphanumeric_key() TO anon, authenticated;

-- Display the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'keys' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Sample keys will be inserted separately after function creation
-- Run this command AFTER the above SQL completes successfully:
-- INSERT INTO public.keys (key_value, marked_as_used) VALUES
-- (generate_alphanumeric_key(16), false),
-- (generate_alphanumeric_key(16), false),
-- (generate_alphanumeric_key(16), false)
-- ON CONFLICT (key_value) DO NOTHING;
