// Subscription Plans Management for Instalow
class SubscriptionPlansManager {
    constructor() {
        this.supabase = null;
        this.plans = [];
        this.init();
    }

    async init() {
        try {
            // Try to get Supabase client from window object
            if (window.supabase) {
                this.supabase = window.supabase.createClient(
                    'https://uwloajvooajxhffphjns.supabase.co',
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bG9hanZvb2FqeGhmZnBoam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjUwNDYsImV4cCI6MjA3MDYwMTA0Nn0.fchJV646Yc1FgiWokclFlUMDJEtRW8X_j_I3TgskQxU'
                );
                console.log('Supabase client initialized in SubscriptionPlansManager');
                
                // Try to fetch plans from Supabase
                await this.fetchSubscriptionPlans();
                if (this.plans.length > 0) {
                    console.log('Found', this.plans.length, 'plans from Supabase');
                    this.renderPricingCards();
                    this.updateHeroButton(); // Update hero button with correct plan info
                } else {
                    console.log('No plans found in Supabase, showing fallback pricing');
                    this.renderFallbackPricing();
                }
            } else {
                console.log('Supabase not available, showing fallback pricing');
                this.renderFallbackPricing();
            }
        } catch (error) {
            console.error('Error initializing subscription plans:', error);
            this.renderFallbackPricing();
        }
    }

    async fetchSubscriptionPlans() {
        try {
            if (!this.supabase) {
                throw new Error('Supabase client not available');
            }

            console.log('Fetching subscription plans from Supabase...');
            const { data, error } = await this.supabase
                .from('subscription_plans')
                .select('*')
                .eq('is_active', true)
                .order('price', { ascending: true });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            
            this.plans = data || [];
            console.log('Successfully fetched subscription plans:', this.plans);
            console.log('Number of plans found:', this.plans.length);
            
            // Log each plan details
            this.plans.forEach((plan, index) => {
                console.log(`Plan ${index + 1}:`, {
                    name: plan.name,
                    type: plan.plan_type,
                    price: plan.price,
                    interval: plan.interval,
                    features: plan.features
                });
            });
        } catch (error) {
            console.error('Error fetching subscription plans:', error);
            throw error;
        }
    }

    formatPrice(price, currency = 'usd') {
        const formattedPrice = (price / 100).toFixed(2);
        const currencySymbol = currency === 'usd' ? '$' : currency;
        return `${currencySymbol}${formattedPrice}`;
    }

    formatInterval(interval) {
        switch (interval) {
            case 'month': return '/month';
            case 'year': return '/year';
            case 'lifetime': return '/one-time';
            default: return '';
        }
    }

    getPlanIcon(planType) {
        switch (planType) {
            case 'free': return '🚀';
            case 'professional': return '⭐';
            case 'enterprise': return '🏢';
            default: return '📦';
        }
    }

    getPlanBadge(planType, trialDays) {
        if (trialDays > 0) {
            return `${trialDays} Days`;
        }
        
        switch (planType) {
            case 'free': return 'Free';
            case 'professional': return 'Pro';
            case 'enterprise': return 'Custom';
            default: return 'Plan';
        }
    }

    getPlanFeatures(features, planType) {
        const defaultFeatures = {
            free: [
                'Basic automation',
                '1 Instagram account',
                'Limited posts',
                'Email support'
            ],
            professional: [
                'Advanced automation',
                '5 Instagram accounts',
                'Unlimited posts',
                'Analytics dashboard',
                'Priority support',
                'AI content generation'
            ],
            enterprise: [
                'Full automation suite',
                'Unlimited accounts',
                'Team management',
                'Custom integrations',
                'Dedicated support',
                'SLA guarantee'
            ]
        };

        // Use features from database if available, otherwise use defaults
        if (features && Array.isArray(features) && features.length > 0) {
            return features;
        }
        
        return defaultFeatures[planType] || defaultFeatures.free;
    }

    renderPricingCards() {
        const pricingCardsContainer = document.querySelector('.pricing-cards');
        if (!pricingCardsContainer) {
            console.error('Pricing cards container not found');
            return;
        }

        // Clear existing cards and loading state
        pricingCardsContainer.innerHTML = '';

        if (this.plans.length === 0) {
            this.renderFallbackPricing();
            return;
        }

        // Render each plan
        this.plans.forEach((plan, index) => {
            const card = this.createPricingCard(plan, index);
            pricingCardsContainer.appendChild(card);
        });

        // Add loading animation
        this.animatePricingCards();
    }

    createPricingCard(plan, index) {
        const card = document.createElement('div');
        card.className = `pricing-card ${plan.plan_type}`;
        card.style.animationDelay = `${index * 0.1}s`;

        const isPopular = plan.plan_type === 'professional';
        const features = this.getPlanFeatures(plan.features, plan.plan_type);

        card.innerHTML = `
            ${isPopular ? '<div class="popular-badge">Most Popular</div>' : ''}
            <div class="card-header">
                <div class="plan-icon">${this.getPlanIcon(plan.plan_type)}</div>
                <h3 class="plan-name">${plan.name}</h3>
    
            </div>
            <div class="plan-price">
                <span class="currency">${this.formatPrice(plan.price, plan.currency).replace(/[0-9.]/g, '')}</span>
                <span class="amount">${this.formatPrice(plan.price, plan.currency).replace(/[^0-9.]/g, '')}</span>
                <span class="period">${this.formatInterval(plan.interval)}</span>
            </div>
            <div class="plan-features">
                ${features.map(feature => `
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span class="feature-text">${feature}</span>
                    </div>
                `).join('')}
            </div>
            <a href="checkout.html?plan=${plan.plan_type}&price=${plan.price}&period=${plan.interval}&trial=${plan.trial_days}" 
               class="pricing-btn ${plan.plan_type}-btn">
                <span class="btn-text">Get Now</span>
                <span class="btn-arrow">→</span>
            </a>
        `;

        return card;
    }

    // Update hero button with correct plan information
    updateHeroButton() {
        const heroBtn = document.getElementById('hero-cta-btn');
        if (!heroBtn) return;
        
        // Find the professional plan
        const proPlan = this.plans.find(plan => plan.plan_type === 'professional');
        if (proPlan) {
            const priceInDollars = proPlan.price / 100;
            const interval = proPlan.interval === 'month' ? 'month' : 
                           proPlan.interval === 'year' ? 'year' : 'lifetime';
            
            // Update the href with correct plan info
            heroBtn.href = `checkout.html?plan=professional&price=${priceInDollars}&period=${interval}`;
            console.log('Updated hero button with plan:', { plan: 'professional', price: priceInDollars, period: interval });
        }
    }

    renderFallbackPricing() {
        const pricingCardsContainer = document.querySelector('.pricing-cards');
        if (!pricingCardsContainer) return;

        pricingCardsContainer.innerHTML = `
            <div class="pricing-card free">
                <div class="card-header">
                    <div class="plan-icon">🚀</div>
                    <h3 class="plan-name">Free Plan</h3>

                </div>
                <div class="plan-price">
                    <span class="currency">$</span>
                    <span class="amount">0</span>
                    <span class="period">/lifetime</span>
                </div>
                <div class="plan-features">
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span class="feature-text">Basic automation</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span class="feature-text">1 Instagram account</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span class="feature-text">Limited posts</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span class="feature-text">Email support</span>
                    </div>
                </div>
                <a href="checkout.html?plan=free&price=0&period=lifetime" class="pricing-btn free-btn">
                    <span class="btn-text">Get Now</span>
                    <span class="btn-arrow">→</span>
                </a>
            </div>

            <div class="pricing-card professional">
                <div class="popular-badge">Most Popular</div>
                <div class="card-header">
                    <div class="plan-icon">⭐</div>
                    <h3 class="plan-name">Pro Plan</h3>

                </div>
                <div class="plan-price">
                    <span class="currency">$</span>
                    <span class="amount">29</span>
                    <span class="period">/month</span>
                </div>
                <div class="plan-features">
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span class="feature-text">Advanced automation</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span class="feature-text">5 Instagram accounts</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span class="feature-text">Unlimited posts</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span class="feature-text">Analytics dashboard</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span class="feature-text">Priority support</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span class="feature-text">AI content generation</span>
                    </div>
                </div>
                <a href="checkout.html?plan=professional&price=29&period=month" class="pricing-btn professional-btn">
                    <span class="btn-text">Get Now</span>
                    <span class="btn-arrow">→</span>
                </a>
            </div>

            <div class="pricing-card enterprise">
                <div class="card-header">
                    <div class="plan-icon">🏢</div>
                    <h3 class="plan-name">Custom Plan</h3>

                </div>
                <div class="plan-price">
                    <span class="currency">$</span>
                    <span class="amount">99</span>
                    <span class="period">/month</span>
                </div>
                <div class="plan-features">
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span class="feature-text">All Pro features</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span class="feature-text">Unlimited accounts</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span class="feature-text">Team management</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span class="feature-text">Custom integrations</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span class="feature-text">Dedicated support</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span class="feature-text">SLA guarantee</span>
                    </div>
                </div>
                <a href="checkout.html?plan=enterprise&price=99&period=month" class="pricing-btn enterprise-btn">
                    <span class="btn-text">Get Now</span>
                    <span class="btn-arrow">→</span>
                </a>
            </div>
        `;
    }

    animatePricingCards() {
        const cards = document.querySelectorAll('.pricing-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.classList.add('loaded');
            }, index * 100);
        });
    }

    // Method to refresh plans (useful for admin updates)
    async refreshPlans() {
        try {
            await this.fetchSubscriptionPlans();
            this.renderPricingCards();
        } catch (error) {
            console.error('Error refreshing plans:', error);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing subscription plans...');
    
    // Wait a bit for Supabase to potentially load
    setTimeout(() => {
        // Check if Supabase is available
        if (window.supabase) {
            console.log('Supabase found, initializing with Supabase support');
            window.subscriptionPlansManager = new SubscriptionPlansManager();
        } else {
            console.log('Supabase not found, initializing with fallback pricing');
            // Fallback to static pricing
            const pricingCardsContainer = document.querySelector('.pricing-cards');
            if (pricingCardsContainer) {
                const fallbackManager = new SubscriptionPlansManager();
                // Force fallback pricing
                fallbackManager.renderFallbackPricing();
            }
        }
    }, 100); // Small delay to allow Supabase to load
});

// Also try to initialize when Supabase becomes available
window.addEventListener('supabase-ready', function() {
    console.log('Supabase ready event received');
    if (!window.subscriptionPlansManager) {
        window.subscriptionPlansManager = new SubscriptionPlansManager();
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SubscriptionPlansManager;
}
