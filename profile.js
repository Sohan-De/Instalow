// Profile Management JavaScript for Instalow
let supabaseClient;
let currentUser = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeSupabase();
    checkAuthState();
    setupPlanTypeField();
});

// Setup plan type field to show helpful message when clicked
function setupPlanTypeField() {
    const planTypeField = document.getElementById('planType');
    if (planTypeField) {
        planTypeField.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Plan type cannot be changed here. Contact support to upgrade your plan.', 'info');
        });
        
        planTypeField.addEventListener('change', function(e) {
            e.preventDefault();
            // Reset to original value since it shouldn't change
            this.value = this.getAttribute('data-original-value') || 'free';
            showNotification('Plan type cannot be changed here. Contact support to upgrade your plan.', 'info');
        });
    }
}

// Initialize Supabase client
function initializeSupabase() {
    if (typeof window.supabase !== 'undefined') {
        supabaseClient = window.supabase.createClient(
            'https://uwloajvooajxhffphjns.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bG9hanZvb2FqeGhmZnBoam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjUwNDYsImV4cCI6MjA3MDYwMTA0Nn0.fchJV646Yc1FgiWokclFlUMDJEtRW8X_j_I3TgskQxU'
        );
        console.log('Supabase client initialized');
    } else {
        console.error('Supabase library not loaded');
        showNotification('Error: Supabase library not loaded', 'error');
    }
}

// Check authentication state
async function checkAuthState() {
    try {
        if (!supabaseClient) {
            showNotification('Error: Supabase client not initialized', 'error');
            return;
        }

        // Check current session
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) throw error;

        if (session && session.user) {
            currentUser = session.user;
            await loadProfile();
        } else {
            // Redirect to auth page if not logged in
            window.location.href = 'auth.html';
        }

    } catch (error) {
        console.error('Auth state check error:', error);
        showNotification('Authentication error. Please sign in again.', 'error');
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 2000);
    }
}

// Check for recent purchases and update plan type
async function checkRecentPurchases() {
    try {
        // Check localStorage for recent purchase info
        const purchaseInfo = localStorage.getItem('instaflow_purchase');
        if (purchaseInfo) {
            const purchase = JSON.parse(purchaseInfo);
            console.log('Found recent purchase:', purchase);
            
            // Update profile with purchase info if it's recent (within last 24 hours)
            const purchaseTime = new Date(purchase.timestamp || Date.now());
            const now = new Date();
            const hoursSincePurchase = (now - purchaseTime) / (1000 * 60 * 60);
            
            if (hoursSincePurchase < 24) {
                console.log('Recent purchase found, updating profile...');
                
                // Determine plan type from purchase info
                let planType = 'free';
                if (purchase.planName && purchase.planName.includes('Professional')) {
                    planType = 'professional';
                } else if (purchase.planName && purchase.planName.includes('Enterprise')) {
                    planType = 'enterprise';
                }
                
                // Update profile in Supabase
                if (supabaseClient && currentUser) {
                    const { data: updatedProfile, error: updateError } = await supabaseClient
                        .from('profiles')
                        .update({
                            plan_type: planType,
                            plan_status: 'active',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', currentUser.id)
                        .select()
                        .single();
                    
                    if (!updateError && updatedProfile) {
                        console.log('Profile updated with recent purchase:', updatedProfile);
                        // Refresh the profile display
                        displayProfile(updatedProfile);
                        populateEditForm(updatedProfile);
                        
                        // Show notification about plan update
                        showNotification(`Plan updated to ${formatPlanType(planType)}!`, 'success');
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error checking recent purchases:', error);
    }
}

// Load user profile from Supabase
async function loadProfile() {
    try {
        showLoading(true);
        
        if (!currentUser) {
            throw new Error('No authenticated user');
        }

        // Get profile from profiles table
        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Profile doesn't exist, create one
                await createProfile();
                return;
            }
            throw error;
        }

        // Display profile data
        displayProfile(profile);
        
        // Populate edit form
        populateEditForm(profile);
        
        // Check for recent purchases and update plan type if needed
        await checkRecentPurchases();

    } catch (error) {
        console.error('Load profile error:', error);
        showNotification('Failed to load profile: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Create new profile for user
async function createProfile() {
    try {
        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .insert([
                {
                    id: currentUser.id,
                    email: currentUser.email,
                    full_name: currentUser.user_metadata?.full_name || '',
                    plan_type: 'free',
                    plan_status: 'active'
                }
            ])
            .select()
            .single();

        if (error) throw error;

        showNotification('Profile created successfully!', 'success');
        displayProfile(profile);
        populateEditForm(profile);

    } catch (error) {
        console.error('Create profile error:', error);
        showNotification('Failed to create profile: ' + error.message, 'error');
    }
}

// Format plan type for display
function formatPlanType(planType) {
    const planNames = {
        'free': '🚀 Free Plan',
        'professional': '💎 Professional Plan',
        'enterprise': '🏢 Enterprise Plan',
        'trial': '⏰ Trial Plan'
    };
    
    return planNames[planType] || '🚀 Free Plan';
}

// Display profile data in view mode
function displayProfile(profile) {
    document.getElementById('displayName').textContent = profile.full_name || 'Not set';
    document.getElementById('displayEmail').textContent = profile.email || 'Not set';
    document.getElementById('displayInstagram').textContent = profile.instagram_username || 'Not set';
    document.getElementById('displayPlan').textContent = formatPlanType(profile.plan_type);
    document.getElementById('displayBio').textContent = profile.bio || 'No bio added';
    
    if (profile.created_at) {
        const date = new Date(profile.created_at);
        document.getElementById('displayCreated').textContent = date.toLocaleDateString();
    } else {
        document.getElementById('displayCreated').textContent = 'Unknown';
    }
}

// Populate edit form with current data
function populateEditForm(profile) {
    document.getElementById('fullName').value = profile.full_name || '';
    document.getElementById('email').value = profile.email || '';
    document.getElementById('instagramUsername').value = profile.instagram_username || '';
    document.getElementById('bio').value = profile.bio || '';
    
    // Set plan type in the select dropdown (read-only)
    const planTypeSelect = document.getElementById('planType');
    if (planTypeSelect) {
        planTypeSelect.value = profile.plan_type || 'free';
        // Keep it disabled to prevent editing
        planTypeSelect.disabled = true;
        planTypeSelect.setAttribute('data-original-value', profile.plan_type || 'free');
    }
    
    document.getElementById('planStatus').value = profile.plan_status || 'active';
}

// Enable edit mode
function enableEditMode() {
    document.getElementById('viewMode').classList.add('hidden');
    document.getElementById('editMode').classList.add('active');
}

// Cancel edit mode
function cancelEdit() {
    document.getElementById('editMode').classList.remove('active');
    document.getElementById('viewMode').classList.remove('hidden');
}

// Handle form submission
document.getElementById('editMode').addEventListener('submit', async function(e) {
    e.preventDefault();
    await updateProfile();
});

// Update profile in Supabase
async function updateProfile() {
    try {
        if (!currentUser) {
            throw new Error('No authenticated user');
        }

        const formData = new FormData(document.getElementById('editMode'));
        const updateData = {
            full_name: formData.get('fullName'),
            instagram_username: formData.get('instagramUsername'),
            bio: formData.get('bio'),
            // Note: plan_type is excluded since it's read-only
            plan_status: formData.get('planStatus')
        };

        console.log('Updating profile with data:', updateData);

        // Update profile in Supabase
        const { data: updatedProfile, error } = await supabaseClient
            .from('profiles')
            .update(updateData)
            .eq('id', currentUser.id)
            .select()
            .single();

        if (error) throw error;

        showNotification('Profile updated successfully!', 'success');
        
        // Switch back to view mode and refresh display
        cancelEdit();
        displayProfile(updatedProfile);

    } catch (error) {
        console.error('Update profile error:', error);
        showNotification('Failed to update profile: ' + error.message, 'error');
    }
}

// Go back to home page
function goToHome() {
    window.location.href = 'index.html';
}

// Show/hide loading spinner
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.add('show');
    } else {
        loading.classList.remove('show');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Set up auth state change listener
if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            window.location.href = 'auth.html';
        }
    });
}

// Logo click handler
function handleLogoClick() {
    console.log('Logo clicked, navigating to home page');
    window.location.href = 'index.html';
}

// Check admin status and show/hide dashboard link
async function checkAdminStatus() {
    try {
        if (!window.supabaseClient) return false;
        
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (!session?.user) return false;
        
        const { data, error } = await window.supabaseClient
            .from('profiles')
            .select('admin')
            .eq('id', session.user.id)
            .single();
        
        if (error) return false;
        
        const isAdmin = data?.admin === true;
        
        // Show/hide dashboard link based on admin status
        const dashboardLinks = document.querySelectorAll('.admin-only');
        dashboardLinks.forEach(link => {
            link.style.display = isAdmin ? 'flex' : 'none';
        });
        
        return isAdmin;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Call admin check when Supabase is ready
window.addEventListener('supabase-ready', checkAdminStatus);

// Also check admin status when auth state changes
window.addEventListener('auth-state-changed', checkAdminStatus);

// Check admin status when page loads
document.addEventListener('DOMContentLoaded', checkAdminStatus);
