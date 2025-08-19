-- Fix Keys Table to Use Serial Numbers (1, 2, 3, 4, 5)
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the existing table completely
DROP TABLE IF EXISTS public.keys CASCADE;

-- Step 2: Create the table fresh with SERIAL key_id
CREATE TABLE public.keys (
    key_id SERIAL PRIMARY KEY,
    key_value TEXT NOT NULL UNIQUE,
    marked_as_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Enable RLS
ALTER TABLE public.keys ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policy
CREATE POLICY "Allow all operations for now" ON public.keys
    FOR ALL USING (true);

-- Step 5: Create indexes
CREATE INDEX idx_keys_key_value ON public.keys(key_value);
CREATE INDEX idx_keys_marked_as_used ON public.keys(marked_as_used);

-- Step 6: Insert the keys with proper numbering
INSERT INTO public.keys (key_value, marked_as_used) VALUES
('A7B2K9M4N8P1Q3R6', false),
('K9M4N8P1Q3R6A7B2', false),
('N8P1Q3R6A7B2K9M4', false),
('B2K9M4N8P1Q3R6A7', false),
('M4N8P1Q3R6A7B2K9', false);

-- Step 7: Show the results
SELECT * FROM public.keys ORDER BY key_id;
