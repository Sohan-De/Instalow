-- Add 4 more partners to make total 6 partners
-- (You already have 2 partners: TechFlow Solutions and Growth Masters)

INSERT INTO partners (name, description, website_url, logo_url, partner_type) VALUES
    ('Digital Dynamics', 'Innovative social media management platform specializing in Instagram analytics and growth strategies for businesses of all sizes.', 'https://digitaldynamics.com', 'https://via.placeholder.com/60x60/ff6b6b/ffffff?text=DD', 'Platform Partner'),
    
    ('Social Sphere', 'Creative agency focused on Instagram content creation, influencer partnerships, and viral marketing campaigns.', 'https://socialsphere.agency', 'https://via.placeholder.com/60x60/9c88ff/ffffff?text=SS', 'Creative Partner'),
    
    ('Tech Innovate', 'Cutting-edge technology solutions provider specializing in AI-powered Instagram automation and smart scheduling tools.', 'https://techinnovate.com', 'https://via.placeholder.com/60x60/00d4ff/ffffff?text=TI', 'Technology Partner'),
    
    ('Growth Catalyst', 'Strategic growth consulting firm helping brands scale their Instagram presence through data-driven insights and optimization.', 'https://growthcatalyst.co', 'https://via.placeholder.com/60x60/00ff88/ffffff?text=GC', 'Strategy Partner');

-- Verify total count (should be 6 now)
-- SELECT COUNT(*) as total_partners FROM partners;
