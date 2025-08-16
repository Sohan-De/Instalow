-- Create Partners Table
CREATE TABLE IF NOT EXISTS partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website_url VARCHAR(500),
    logo_url VARCHAR(500),
    partner_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample partner data
INSERT INTO partners (name, description, website_url, logo_url, partner_type) VALUES
    ('TechFlow Solutions', 'Leading AI-powered automation engine provider with cutting-edge solutions for Instagram automation.', 'https://techflow-solutions.com', 'https://via.placeholder.com/60x60/00d4ff/ffffff?text=TF', 'Technology Partner'),
    ('Growth Masters', 'Digital marketing specialists & social media experts helping brands grow their Instagram presence.', 'https://growthmasters.com', 'https://via.placeholder.com/60x60/00ff88/ffffff?text=GM', 'Agency Partner'),
    ('Meta Connect', 'Official Instagram partner & strategic collaborator for platform integration and market expansion.', 'https://metaconnect.com', 'https://via.placeholder.com/60x60/ff6b6b/ffffff?text=MC', 'Platform Partner');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_partners_partner_type ON partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_partners_created_at ON partners(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow public read access to partners
CREATE POLICY "Allow public read access to partners" ON partners
    FOR SELECT USING (true);

-- Allow authenticated users to insert partners (if you want admin functionality)
CREATE POLICY "Allow authenticated users to insert partners" ON partners
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update partners
CREATE POLICY "Allow authenticated users to update partners" ON partners
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete partners
CREATE POLICY "Allow authenticated users to delete partners" ON partners
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_partners_updated_at 
    BEFORE UPDATE ON partners 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
