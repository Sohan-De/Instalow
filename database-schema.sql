-- Subscription Table for Instalow - Admin Controllable
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to start fresh (this will remove any conflicting data)
DROP TABLE IF EXISTS public.subscription_usage CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.subscription_plans CASCADE;

-- Create subscription plans table (for admin to manage)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'professional', 'enterprise')),
    description TEXT,
    price INTEGER NOT NULL, -- Price in cents
    currency TEXT DEFAULT 'usd',
    interval TEXT NOT NULL CHECK (interval IN ('month', 'year', 'lifetime')),
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    max_instagram_accounts INTEGER DEFAULT 1,
    max_automation_campaigns INTEGER DEFAULT 1,
    max_scheduled_posts INTEGER DEFAULT 10,
    trial_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table (for user subscriptions)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid', 'trialing', 'paused')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    amount_paid INTEGER, -- Amount actually paid in cents
    currency TEXT DEFAULT 'usd',
    admin_notes TEXT, -- For admin to add notes
    is_admin_managed BOOLEAN DEFAULT false, -- Flag for admin-managed subscriptions
    admin_user_id UUID REFERENCES auth.users(id), -- Which admin created/managed this
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription usage tracking table
CREATE TABLE IF NOT EXISTS public.subscription_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    feature_name TEXT NOT NULL, -- e.g., 'instagram_accounts', 'automation_campaigns'
    current_usage INTEGER DEFAULT 0,
    limit_amount INTEGER NOT NULL,
    reset_date DATE NOT NULL, -- When usage resets
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admin can manage all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admin can manage subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Users can view own usage" ON public.subscription_usage;
DROP POLICY IF EXISTS "Admin can manage all usage" ON public.subscription_usage;

-- RLS Policies for subscription_plans (admin can manage, users can view)
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage subscription plans" ON public.subscription_plans
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE email IN ('admin@instalow.com', 'your-admin-email@domain.com')
        )
    );

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all subscriptions" ON public.subscriptions
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE email IN ('admin@instalow.com', 'your-admin-email@domain.com')
        )
    );

-- RLS Policies for subscription_usage
CREATE POLICY "Users can view own usage" ON public.subscription_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all usage" ON public.subscription_usage
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE email IN ('admin@instalow.com', 'your-admin-email@domain.com')
        )
    );

-- Create function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON public.subscription_plans;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
DROP TRIGGER IF EXISTS update_subscription_usage_updated_at ON public.subscription_usage;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_usage_updated_at BEFORE UPDATE ON public.subscription_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_type ON public.subscription_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_id ON public.subscription_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_subscription_id ON public.subscription_usage(subscription_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.subscription_plans TO anon, authenticated;
GRANT ALL ON public.subscriptions TO anon, authenticated;
GRANT ALL ON public.subscription_usage TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO anon, authenticated;

-- Insert default subscription plans (you can modify these in Supabase)
INSERT INTO public.subscription_plans (name, plan_type, description, price, interval, features, max_instagram_accounts, max_automation_campaigns, max_scheduled_posts, trial_days) VALUES
('Free Plan', 'free', 'Basic features for getting started', 0, 'lifetime', '["Basic automation", "1 Instagram account", "Limited posts"]', 1, 1, 10, 0),
('Professional Plan', 'professional', 'Advanced features for growing businesses', 4900, 'month', '["Advanced automation", "5 Instagram accounts", "Unlimited posts", "Analytics"]', 5, 10, 999999, 7),
('Enterprise Plan', 'enterprise', 'Full-featured solution for large teams', 9900, 'month', '["Full automation", "Unlimited accounts", "Priority support", "Custom features"]', 999999, 999999, 999999, 14)
ON CONFLICT (name) DO NOTHING;
