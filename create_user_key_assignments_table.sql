-- Create user_key_assignments table to track key assignments
CREATE TABLE IF NOT EXISTS user_key_assignments (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    key_id INTEGER REFERENCES keys(key_id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_key_assignments_user_id ON user_key_assignments(user_id);
CREATE INDEX idx_user_key_assignments_key_id ON user_key_assignments(key_id);
CREATE INDEX idx_user_key_assignments_plan_id ON user_key_assignments(plan_id);
CREATE INDEX idx_user_key_assignments_status ON user_key_assignments(status);

-- Add RLS policies for security
ALTER TABLE user_key_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own key assignments
CREATE POLICY "Users can view own key assignments" ON user_key_assignments
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Only admins can insert/update/delete key assignments
CREATE POLICY "Admins can manage key assignments" ON user_key_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.admin = true
        )
    );

-- Add user_id and used_at columns to keys table if they don't exist
DO $$ 
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'keys' AND column_name = 'user_id') THEN
        ALTER TABLE keys ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    
    -- Add used_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'keys' AND column_name = 'used_at') THEN
        ALTER TABLE keys ADD COLUMN used_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create index on keys.user_id for better performance
CREATE INDEX IF NOT EXISTS idx_keys_user_id ON keys(user_id);
CREATE INDEX IF NOT EXISTS idx_keys_used_at ON keys(used_at);
