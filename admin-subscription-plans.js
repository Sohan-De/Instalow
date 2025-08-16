// Admin Subscription Plans Management
class AdminSubscriptionPlansManager {
    constructor() {
        this.supabase = window.supabase;
        this.plans = [];
        this.init();
    }

    async init() {
        try {
            await this.loadPlans();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing admin manager:', error);
            this.showError('Failed to initialize admin manager');
        }
    }

    setupEventListeners() {
        const form = document.getElementById('addPlanForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleAddPlan(e));
        }
    }

    async loadPlans() {
        try {
            const { data, error } = await this.supabase
                .from('subscription_plans')
                .select('*')
                .order('price', { ascending: true });

            if (error) throw error;
            
            this.plans = data || [];
            this.renderPlansList();
        } catch (error) {
            console.error('Error loading plans:', error);
            this.showError('Failed to load plans');
        }
    }

    renderPlansList() {
        const plansList = document.getElementById('plansList');
        if (!plansList) return;

        if (this.plans.length === 0) {
            plansList.innerHTML = '<div class="no-plans">No plans found. Add your first plan above!</div>';
            return;
        }

        plansList.innerHTML = this.plans.map(plan => `
            <div class="plan-item" data-plan-id="${plan.id}">
                <div class="plan-header">
                    <div class="plan-info">
                        <h3 class="plan-name">${plan.name}</h3>
                        <span class="plan-type ${plan.plan_type}">${plan.plan_type}</span>
                    </div>
                    <div class="plan-price">
                        $${(plan.price / 100).toFixed(2)} ${plan.interval}
                    </div>
                </div>
                <div class="plan-details">
                    <p class="plan-description">${plan.description || 'No description'}</p>
                    <div class="plan-features">
                        <strong>Features:</strong> ${this.formatFeatures(plan.features)}
                    </div>
                    <div class="plan-limits">
                        <span>Max Accounts: ${plan.max_instagram_accounts}</span>
                        <span>Trial: ${plan.trial_days} days</span>
                    </div>
                </div>
                <div class="plan-actions">
                    <button class="btn-edit" onclick="editPlan('${plan.id}')">✏️ Edit</button>
                    <button class="btn-toggle" onclick="togglePlan('${plan.id}', ${plan.is_active})">
                        ${plan.is_active ? '🟢 Active' : '🔴 Inactive'}
                    </button>
                    <button class="btn-delete" onclick="deletePlan('${plan.id}')">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    }

    formatFeatures(features) {
        if (!features || !Array.isArray(features)) return 'Default features';
        return features.join(', ');
    }

    async handleAddPlan(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const planData = {
            name: formData.get('name'),
            plan_type: formData.get('plan_type'),
            description: formData.get('description'),
            price: parseInt(formData.get('price')) * 100, // Convert dollars to cents
            interval: formData.get('interval'),
            trial_days: parseInt(formData.get('trial_days')) || 0,
            max_instagram_accounts: parseInt(formData.get('max_instagram_accounts')),
            features: this.parseFeatures(formData.get('features')),
            is_active: true
        };

        try {
            const { data, error } = await this.supabase
                .from('subscription_plans')
                .insert([planData])
                .select();

            if (error) throw error;

            this.showSuccess('Plan added successfully!');
            event.target.reset();
            await this.loadPlans();
        } catch (error) {
            console.error('Error adding plan:', error);
            this.showError('Failed to add plan: ' + error.message);
        }
    }

    parseFeatures(featuresText) {
        if (!featuresText || featuresText.trim() === '') return null;
        
        try {
            return JSON.parse(featuresText);
        } catch (error) {
            console.error('Invalid JSON for features:', error);
            return null;
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Global functions for button actions
async function editPlan(planId) {
    // Implementation for editing plans
    alert('Edit functionality coming soon! Plan ID: ' + planId);
}

async function togglePlan(planId, currentStatus) {
    try {
        const newStatus = !currentStatus;
        const { error } = await window.supabase
            .from('subscription_plans')
            .update({ is_active: newStatus })
            .eq('id', planId);

        if (error) throw error;

        // Refresh the plans list
        if (window.adminManager) {
            await window.adminManager.loadPlans();
        }
    } catch (error) {
        console.error('Error toggling plan:', error);
        alert('Failed to toggle plan status');
    }
}

async function deletePlan(planId) {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
        return;
    }

    try {
        const { error } = await window.supabase
            .from('subscription_plans')
            .delete()
            .eq('id', planId);

        if (error) throw error;

        // Refresh the plans list
        if (window.adminManager) {
            await window.adminManager.loadPlans();
        }
    } catch (error) {
        console.error('Error deleting plan:', error);
        alert('Failed to delete plan');
    }
}

function refreshPlans() {
    if (window.adminManager) {
        window.adminManager.loadPlans();
    }
}

function exportPlans() {
    if (window.adminManager && window.adminManager.plans) {
        const dataStr = JSON.stringify(window.adminManager.plans, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'subscription-plans.json';
        link.click();
        URL.revokeObjectURL(url);
    }
}

function showDefaultPlans() {
    const defaultPlans = [
        {
            name: 'Free Trial',
            plan_type: 'free',
            description: 'Basic features for getting started',
            price: 0,
            interval: 'lifetime',
            features: ['Basic automation', '1 Instagram account', 'Limited posts', 'Email support'],
            max_instagram_accounts: 1,
            trial_days: 7
        },
        {
            name: 'Professional',
            plan_type: 'professional',
            description: 'Advanced features for growing businesses',
            price: 4900,
            interval: 'month',
            features: ['Advanced automation', '5 Instagram accounts', 'Unlimited posts', 'Analytics', 'Priority support', 'AI content generation'],
            max_instagram_accounts: 5,
            trial_days: 0
        },
        {
            name: 'Enterprise',
            plan_type: 'enterprise',
            description: 'Full-featured solution for large teams',
            price: 9900,
            interval: 'month',
            features: ['Full automation suite', 'Unlimited accounts', 'Team management', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
            max_instagram_accounts: 999999,
            trial_days: 0
        }
    ];

    const plansList = document.getElementById('plansList');
    if (plansList) {
        plansList.innerHTML = defaultPlans.map(plan => `
            <div class="plan-item default-plan">
                <div class="plan-header">
                    <div class="plan-info">
                        <h3 class="plan-name">${plan.name}</h3>
                        <span class="plan-type ${plan.plan_type}">${plan.plan_type}</span>
                    </div>
                    <div class="plan-price">
                        $${(plan.price / 100).toFixed(2)} ${plan.interval}
                    </div>
                </div>
                <div class="plan-details">
                    <p class="plan-description">${plan.description}</p>
                    <div class="plan-features">
                        <strong>Features:</strong> ${plan.features.join(', ')}
                    </div>
                    <div class="plan-limits">
                        <span>Max Accounts: ${plan.max_instagram_accounts}</span>
                        <span>Trial: ${plan.trial_days} days</span>
                    </div>
                </div>
                <div class="plan-actions">
                    <button class="btn-import" onclick="importDefaultPlan(${JSON.stringify(plan).replace(/"/g, '&quot;')})">
                        📥 Import This Plan
                    </button>
                </div>
            </div>
        `).join('');
    }
}

async function importDefaultPlan(planData) {
    try {
        const { error } = await window.supabase
            .from('subscription_plans')
            .insert([planData]);

        if (error) throw error;

        alert('Plan imported successfully!');
        if (window.adminManager) {
            await window.adminManager.loadPlans();
        }
    } catch (error) {
        console.error('Error importing plan:', error);
        alert('Failed to import plan: ' + error.message);
    }
}

function resetForm() {
    document.getElementById('addPlanForm').reset();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.supabase) {
        window.adminManager = new AdminSubscriptionPlansManager();
    } else {
        console.error('Supabase client not found');
        document.body.innerHTML = '<div class="error">Supabase client not found. Please check your configuration.</div>';
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminSubscriptionPlansManager;
}
