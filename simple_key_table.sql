-- Simple Key Table Creation for Instaflow
-- Run this in your Supabase SQL Editor

-- Step 1: Create the basic table
CREATE TABLE IF NOT EXISTS public.keys (
    key_id SERIAL PRIMARY KEY,
    key_value TEXT NOT NULL UNIQUE,
    marked_as_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable RLS
ALTER TABLE public.keys ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies and create new ones
DROP POLICY IF EXISTS "Allow all operations for now" ON public.keys;
CREATE POLICY "Allow all operations for now" ON public.keys
    FOR ALL USING (true);

-- Step 4: Create basic indexes
CREATE INDEX IF NOT EXISTS idx_keys_key_value ON public.keys(key_value);
CREATE INDEX IF NOT EXISTS idx_keys_marked_as_used ON public.keys(marked_as_used);

-- Step 5: Insert 16-digit alphanumeric keys
INSERT INTO public.keys (key_value, marked_as_used) VALUES
('A7B2K9M4N8P1Q3R6', false),
('K9M4N8P1Q3R6A7B2', false),
('N8P1Q3R6A7B2K9M4', false),
('B2K9M4N8P1Q3R6A7', false),
('M4N8P1Q3R6A7B2K9', false)
ON CONFLICT (key_value) DO NOTHING;

-- Step 6: Show the results
SELECT * FROM public.keys;
