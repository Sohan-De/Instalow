// Script to update existing plan prices from dollars to cents
// Run this in your browser console on the admin dashboard page

async function updatePlanPrices() {
    try {
        console.log('🔄 Starting price update...');
        
        // Get Supabase client
        if (!window.supabaseClient) {
            console.error('❌ Supabase client not available');
            return;
        }
        
        // Fetch current plans
        const { data: plans, error } = await window.supabaseClient
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true);
            
        if (error) {
            console.error('❌ Error fetching plans:', error);
            return;
        }
        
        console.log('📋 Current plans:', plans);
        
        // Update each plan price to cents
        for (const plan of plans) {
            if (plan.price < 100) { // If price is less than $1, it's probably in dollars
                const newPrice = Math.round(plan.price * 100);
                console.log(`💰 Updating ${plan.name}: $${plan.price} → $${(newPrice/100).toFixed(2)} (${newPrice} cents)`);
                
                const { error: updateError } = await window.supabaseClient
                    .from('subscription_plans')
                    .update({ price: newPrice })
                    .eq('id', plan.id);
                    
                if (updateError) {
                    console.error(`❌ Failed to update ${plan.name}:`, updateError);
                } else {
                    console.log(`✅ Successfully updated ${plan.name}`);
                }
            } else {
                console.log(`ℹ️ ${plan.name} price already in cents: ${plan.price}`);
            }
        }
        
        console.log('🎉 Price update completed!');
        console.log('🔄 Refreshing plans list...');
        
        // Refresh the plans list
        if (window.adminManager) {
            await window.adminManager.loadPlans();
        } else if (typeof loadSubscriptionPlans === 'function') {
            loadSubscriptionPlans();
        }
        
    } catch (error) {
        console.error('❌ Error updating prices:', error);
    }
}

// Run the update
console.log('🚀 Running price update script...');
updatePlanPrices();
