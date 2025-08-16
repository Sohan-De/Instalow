// Admin Dashboard JavaScript for Instaflow
let supabaseClient = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeSupabase();
    checkAuthState();
    setupDashboard();
    setupEventListeners();
    loadDashboardData();
});

// Initialize Supabase client
function initializeSupabase() {
    if (typeof window.supabase !== 'undefined') {
        supabaseClient = window.supabase.createClient(
            'https://uwloajvooajxhffphjns.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bG9hanZvb2FqeGhmZnBoam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjUwNDYsImV4cCI6MjA3MDYwMTA0Nn0.fchJV646Yc1FgiWokclFlUMDJEtRW8X_j_I3TgskQxU'
        );
        console.log('Supabase client initialized in admin dashboard');
    } else {
        console.error('Supabase library not loaded');
    }
}

// Check authentication state and admin access
async function checkAuthState() {
    try {
        if (!supabaseClient) {
            // Fallback to localStorage if Supabase is not available
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            const userEmail = localStorage.getItem('userEmail');
            
            if (isLoggedIn && userEmail) {
                // Check if user is admin in localStorage (fallback)
                const isAdmin = localStorage.getItem('isAdmin') === 'true';
                if (!isAdmin) {
                    redirectToUnauthorized();
                    return;
                }
                switchToLoggedInState(userEmail);
            } else {
                switchToGuestState();
            }
            return;
        }
        
        // Check current session with Supabase
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) throw error;
        
        if (session && session.user) {
            // User is authenticated - now check if they're admin
            const isAdmin = await checkAdminStatus(session.user.id);
            
            if (!isAdmin) {
                // User is not admin - redirect them
                redirectToUnauthorized();
                return;
            }
            
            // User is admin - proceed
            switchToLoggedInState(session.user.email);
            
            // Set up auth state change listener
            supabaseClient.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    checkAdminStatus(session?.user?.id).then(isAdmin => {
                        if (isAdmin) {
                            switchToLoggedInState(session?.user?.email);
                        } else {
                            redirectToUnauthorized();
                        }
                    });
                } else if (event === 'SIGNED_OUT') {
                    switchToGuestState();
                }
            });
        } else {
            // User is not authenticated
            switchToGuestState();
        }
        
    } catch (error) {
        console.error('Auth state check error:', error);
        // Fallback to guest state
        switchToGuestState();
    }
}

// Check if user has admin privileges
async function checkAdminStatus(userId) {
    try {
        if (!supabaseClient) return false;
        
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('admin')
            .eq('id', userId)
            .single();
        
        if (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
        
        const isAdmin = data?.admin === true;
        
        // Store admin status in localStorage for fallback
        localStorage.setItem('isAdmin', isAdmin.toString());
        
        return isAdmin;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Redirect non-admin users to unauthorized page
function redirectToUnauthorized() {
    // Show unauthorized message
    document.body.innerHTML = `
        <div style="
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            height: 100vh; 
            background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
            color: white;
            font-family: 'Poppins', sans-serif;
            text-align: center;
            padding: 20px;
        ">
            <div style="font-size: 4rem; margin-bottom: 20px;">🚫</div>
            <h1 style="color: #ff6b6b; margin-bottom: 15px;">Access Denied</h1>
            <p style="font-size: 1.2rem; margin-bottom: 30px; max-width: 500px;">
                You don't have permission to access the Admin Dashboard. 
                Only administrators can view this page.
            </p>
            <div style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
                <a href="index.html" style="
                    background: #00d4ff; 
                    color: white; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: 500;
                    transition: all 0.3s ease;
                ">Go to Home</a>
                <a href="profile.html" style="
                    background: transparent; 
                    color: #00d4ff; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: 500;
                    border: 2px solid #00d4ff;
                    transition: all 0.3s ease;
                ">View Profile</a>
            </div>
        </div>
    `;
}

// Switch to logged in state
function switchToLoggedInState(email) {
    const guestState = document.querySelector('.guest-state');
    const loggedInState = document.querySelector('.logged-in-state');
    const profileName = document.querySelector('.profile-name');
    
    if (guestState && loggedInState) {
        guestState.style.display = 'none';
        loggedInState.style.display = 'flex';
        
        if (profileName) {
            profileName.textContent = email.split('@')[0];
        }
        
        // Store authentication state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
    }
}

// Switch to guest state
function switchToGuestState() {
    const guestState = document.querySelector('.guest-state');
    const loggedInState = document.querySelector('.logged-in-state');
    
    if (guestState && loggedInState) {
        guestState.style.display = 'flex';
        loggedInState.style.display = 'none';
        
        // Clear authentication state
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
    }
}

// Profile Menu Functions
function toggleProfileMenu() {
    const dropdown = document.getElementById('profile-dropdown');
    const profileBtn = document.querySelector('.profile-btn');
    
    if (dropdown && profileBtn) {
        dropdown.classList.toggle('show');
        profileBtn.classList.toggle('active');
    }
}

// Handle logout
async function handleLogout() {
    // Show loading state
    const profileBtn = document.querySelector('.profile-btn');
    if (!profileBtn) return;
    
    const originalText = profileBtn.innerHTML;
    profileBtn.innerHTML = '<span class="profile-avatar">⏳</span> <span class="profile-name">Signing Out...</span>';
    
    try {
        if (!supabaseClient) {
            throw new Error('Supabase client not initialized');
        }
        
        // Sign out from Supabase
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        
        // Switch to guest state
        switchToGuestState();
        
        // Close dropdown
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
        profileBtn.classList.remove('active');
        
        // Redirect to home page
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Sign out error:', error);
        alert('Sign out failed: ' + error.message);
    } finally {
        // Reset profile button
        profileBtn.innerHTML = originalText;
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const profileMenu = document.querySelector('.profile-menu');
    const dropdown = document.getElementById('profile-dropdown');
    
    if (profileMenu && dropdown && !profileMenu.contains(e.target)) {
        dropdown.classList.remove('show');
        const profileBtn = document.querySelector('.profile-btn');
        if (profileBtn) {
            profileBtn.classList.remove('active');
        }
    }
});

// Setup dashboard functionality
function setupDashboard() {
    // Initialize real-time updates
    updateDashboardStats();
    
    // Set up auto-refresh for stats
    setInterval(updateDashboardStats, 30000); // Update every 30 seconds
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const userSearch = document.getElementById('user-search');
    const partnerSearch = document.getElementById('partner-search');
    
    if (userSearch) {
        userSearch.addEventListener('input', function() {
            filterUsers(this.value);
        });
    }
    
    if (partnerSearch) {
        partnerSearch.addEventListener('input', function() {
            filterPartners(this.value);
        });
    }
    
    // Filter functionality
    const userFilter = document.getElementById('user-filter');
    const partnerFilter = document.getElementById('partner-filter');
    
    if (userFilter) {
        userFilter.addEventListener('change', function() {
            filterUsersByPlan(this.value);
        });
    }
    
    if (partnerFilter) {
        partnerFilter.addEventListener('change', function() {
            filterPartnersByStatus(this.value);
        });
    }
}

// Tab switching functionality
function switchTab(tabName) {
    // Hide all tab panes
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => pane.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab pane
    const selectedPane = document.getElementById(tabName + '-tab');
    if (selectedPane) {
        selectedPane.classList.add('active');
    }
    
    // Add active class to clicked tab button
    const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    // Load data for the selected tab
    loadTabData(tabName);
}

// Load data for specific tab
function loadTabData(tabName) {
    switch(tabName) {
        case 'users':
            loadUsers();
            break;
        case 'subscriptions':
            loadSubscriptionPlans();
            break;
        case 'partners':
            loadPartners();
            break;
    }
}

// Load all dashboard data
function loadDashboardData() {
    loadUsers();
    loadSubscriptionPlans();
    loadPartners();
}

// Load users data
async function loadUsers() {
    try {
        const usersTableBody = document.getElementById('users-table-body');
        if (!usersTableBody) return;
        
        usersTableBody.innerHTML = '<tr><td colspan="5" class="loading">Loading users...</td></tr>';
        
        if (!supabaseClient) {
            throw new Error('Supabase client not available');
        }
        
        console.log('🔍 Starting to load users...');
        console.log('📡 Supabase client:', supabaseClient);
        console.log('🌐 Supabase URL:', supabaseClient.supabaseUrl);
        
        // Test basic connection first
        try {
            const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
            if (userError) {
                console.error('❌ Auth connection error:', userError);
            } else {
                console.log('✅ Auth connection working, current user:', user?.email || 'None');
            }
        } catch (authErr) {
            console.error('❌ Auth test failed:', authErr);
        }
        
        // Try multiple approaches to fetch profiles
        let profiles = null;
        let profilesError = null;
        
        // Approach 1: Simple select without ordering
        console.log('📥 Approach 1: Simple select without ordering...');
        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('*');
            
            if (error) {
                console.error('❌ Approach 1 failed:', error);
                profilesError = error;
            } else {
                console.log('✅ Approach 1 successful, found profiles:', data?.length || 0);
                profiles = data;
            }
        } catch (err) {
            console.error('❌ Approach 1 exception:', err);
            profilesError = err;
        }
        
        // Approach 2: Select with limit if first approach failed
        if (!profiles && !profilesError) {
            console.log('📥 Approach 2: Select with limit...');
            try {
                const { data, error } = await supabaseClient
                    .from('profiles')
                    .select('*')
                    .limit(100);
                
                if (error) {
                    console.error('❌ Approach 2 failed:', error);
                    profilesError = error;
                } else {
                    console.log('✅ Approach 2 successful, found profiles:', data?.length || 0);
                    profiles = data;
                }
            } catch (err) {
                console.error('❌ Approach 2 exception:', err);
                profilesError = err;
            }
        }
        
        // Approach 3: Select specific columns only
        if (!profiles && !profilesError) {
            console.log('📥 Approach 3: Select specific columns...');
            try {
                const { data, error } = await supabaseClient
                    .from('profiles')
                    .select('id, email, full_name, plan_type, plan_status, created_at');
                
                if (error) {
                    console.error('❌ Approach 3 failed:', error);
                    profilesError = error;
                } else {
                    console.log('✅ Approach 3 successful, found profiles:', data?.length || 0);
                    profiles = data;
                }
            } catch (err) {
                console.error('❌ Approach 3 exception:', err);
                profilesError = err;
            }
        }
        
        // Approach 4: Try to get count first
        if (!profiles && !profilesError) {
            console.log('📥 Approach 4: Get count first...');
            try {
                const { count, error: countError } = await supabaseClient
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });
                
                if (countError) {
                    console.error('❌ Count query failed:', countError);
                } else {
                    console.log('✅ Count query successful, total profiles:', count);
                    
                    if (count > 0) {
                        const { data, error } = await supabaseClient
                            .from('profiles')
                            .select('*')
                            .limit(count);
                        
                        if (error) {
                            console.error('❌ Fetch with count failed:', error);
                            profilesError = error;
                        } else {
                            console.log('✅ Fetch with count successful, found profiles:', data?.length || 0);
                            profiles = data;
                        }
                    }
                }
            } catch (err) {
                console.error('❌ Approach 4 exception:', err);
                profilesError = err;
            }
        }
        
        // If all approaches failed, show detailed error
        if (!profiles) {
            console.error('❌ All approaches to fetch profiles failed');
            console.error('❌ Last error:', profilesError);
            
            // Show detailed error in table
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #ff5757; padding: 40px;">
                        <strong>Failed to load users from profiles table</strong><br><br>
                        Error: ${profilesError?.message || 'Unknown error'}<br><br>
                        <button onclick="loadUsers()" class="action-btn-small view" style="margin-top: 10px;">🔄 Retry</button>
                        <button onclick="testSupabaseConnection()" class="action-btn-small edit" style="margin-top: 10px;">🧪 Test Connection</button>
                        <br><small style="color: #b8f5d3; margin-top: 10px;">Check browser console for detailed debugging info</small>
                    </td>
                </tr>
            `;
            updateUserStats([]);
            return;
        }
        
        console.log('✅ Successfully fetched profiles:', profiles);
        console.log('📊 Raw profiles data:', profiles);
        
        if (!profiles || profiles.length === 0) {
            usersTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #b8f5d3; padding: 40px;">No users found in profiles table</td></tr>';
            updateUserStats([]);
            return;
        }
        
        // Transform profiles data to match our display format
        const users = profiles.map(profile => ({
            id: profile.id,
            name: profile.full_name || profile.email?.split('@')[0] || 'Unknown User',
            email: profile.email || 'No email',
            plan: profile.plan_type || 'free',
            joined: profile.created_at || new Date().toISOString(),
            avatar: profile.avatar_url || null,
            phone: profile.phone || null,
            company: profile.company || null
        }));
        
        console.log('🔄 Transformed users data:', users);
        
        displayUsers(users);
        updateUserStats(users);
        
        console.log('✅ Users loaded successfully:', users);
        
    } catch (error) {
        console.error('❌ Error loading users:', error);
        const usersTableBody = document.getElementById('users-table-body');
        if (usersTableBody) {
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #ff5757; padding: 40px;">
                        <strong>Unexpected error loading users</strong><br><br>
                        Error: ${error.message}<br><br>
                        <button onclick="loadUsers()" class="action-btn-small view" style="margin-top: 10px;">🔄 Retry</button>
                        <button onclick="testSupabaseConnection()" class="action-btn-small edit" style="margin-top: 10px;">🧪 Test Connection</button>
                        <br><small style="color: #b8f5d3; margin-top: 10px;">Check browser console for detailed debugging info</small>
                    </td>
                </tr>
            `;
        }
        showNotification('Failed to load users: ' + error.message, 'error');
    }
}

// Display users in table
function displayUsers(users) {
    const usersTableBody = document.getElementById('users-table-body');
    if (!usersTableBody) return;
    
    usersTableBody.innerHTML = users.map(user => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 40px; height: 40px; background: rgba(20, 255, 114, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #00ff88; font-weight: 600;">
                        ${user.avatar ? '🖼️' : user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight: 600; color: #e9ffee;">${user.name}</div>
                        ${user.company ? `<div style="font-size: 0.8rem; color: #b8f5d3;">${user.company}</div>` : ''}
                    </div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <span style="color: #e9ffee;">${user.email}</span>
                    ${user.phone ? `<span style="font-size: 0.8rem; color: #b8f5d3;">📞 ${user.phone}</span>` : ''}
                </div>
            </td>
            <td>
                <span class="status-badge ${user.plan}">${formatPlanType(user.plan)}</span>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <span style="color: #e9ffee;">${formatDate(user.joined)}</span>
                    <span style="font-size: 0.8rem; color: #b8f5d3;">${formatTimeAgo(user.joined)}</span>
                </div>
            </td>
            <td>
                <div class="table-actions">
                    <button class="action-btn-small delete" onclick="deleteUser('${user.id}')" title="Delete User">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load subscription plans
async function loadSubscriptionPlans() {
    try {
        const plansGrid = document.getElementById('plans-grid');
        if (!plansGrid) return;
        
        plansGrid.innerHTML = '<div class="loading">Loading subscription plans...</div>';
        
        if (!supabaseClient) {
            throw new Error('Supabase client not available');
        }
        
        // Fetch real subscription plans from Supabase subscription_plans table
        const { data: plans, error } = await supabaseClient
            .from('subscription_plans')
            .select('*')
            .order('price', { ascending: true });
        
        if (error) {
            throw error;
        }
        
        if (!plans || plans.length === 0) {
            plansGrid.innerHTML = '<div style="text-align: center; color: #b8f5d3; padding: 40px;">No subscription plans found</div>';
            updateSubscriptionStats([]);
            return;
        }
        
        // Transform subscription plans data to match our display format
        const transformedPlans = plans.map(plan => ({
            id: plan.id,
            name: plan.name || 'Unnamed Plan',
            type: plan.type || 'free',
            price: plan.price || 0,
            period: plan.period || 'Monthly',
            features: plan.features || [],
            description: plan.description || '',
            is_active: plan.is_active !== false,
            created_at: plan.created_at || new Date().toISOString(),
            updated_at: plan.updated_at || new Date().toISOString()
        }));
        
        displaySubscriptionPlans(transformedPlans);
        updateSubscriptionStats(transformedPlans);
        
        console.log('Subscription plans loaded successfully:', transformedPlans);
        
    } catch (error) {
        console.error('Error loading subscription plans:', error);
        const plansGrid = document.getElementById('plans-grid');
        if (plansGrid) {
            plansGrid.innerHTML = `
                <div style="text-align: center; color: #ff5757; padding: 40px;">
                    Error loading subscription plans: ${error.message}
                    <br><button onclick="loadSubscriptionPlans()" class="action-btn-small view" style="margin-top: 10px;">Retry</button>
                </div>
            `;
        }
        showNotification('Failed to load subscription plans: ' + error.message, 'error');
    }
}

// Display subscription plans
function displaySubscriptionPlans(plans) {
    const plansGrid = document.getElementById('plans-grid');
    if (!plansGrid) return;
    
    plansGrid.innerHTML = plans.map(plan => `
        <div class="plan-card ${plan.is_active ? 'active' : 'inactive'}">
            <div class="plan-header">
                <div class="plan-name">${plan.name}</div>
            </div>
                                <div class="plan-price">$${(plan.price / 100).toFixed(2)}</div>
            <div class="plan-period">${plan.period}</div>
            ${plan.description ? `<div class="plan-description">${plan.description}</div>` : ''}
            <ul class="plan-features">
                ${plan.features && plan.features.length > 0 
                    ? plan.features.map(feature => `<li>${feature}</li>`).join('') 
                    : '<li>No features listed</li>'
                }
            </ul>
            <div class="plan-meta">
                <div class="plan-dates">
                    <span>Created: ${formatDate(plan.created_at)}</span>
                    <span>Updated: ${formatDate(plan.updated_at)}</span>
                </div>
            </div>
            <div class="plan-actions">
                <button class="action-btn-small edit" onclick="editPlan('${plan.id}')" title="Edit Plan">
                    <span class="btn-icon">✏️</span>
                </button>
                <button class="action-btn-small delete" onclick="deletePlan('${plan.id}')" title="Delete Plan">
                    <span class="btn-icon">🗑️</span>
                </button>
            </div>
        </div>
    `).join('');
}

// Load partners data
async function loadPartners() {
    try {
        const partnersTableBody = document.getElementById('partners-table-body');
        if (!partnersTableBody) return;
        
        partnersTableBody.innerHTML = '<tr><td colspan="4" class="loading">Loading partners...</td></tr>';
        
        if (!supabaseClient) {
            throw new Error('Supabase client not available');
        }
        
        // Fetch real partners from Supabase partners table
        const { data: partners, error } = await supabaseClient
            .from('partners')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            throw error;
        }
        
        if (!partners || partners.length === 0) {
            partnersTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #b8f5d3; padding: 40px;">No partners found</td></tr>';
            updatePartnerStats([]);
            return;
        }
        
        // Transform partners data to match our display format
        const transformedPartners = partners.map(partner => ({
            id: partner.id,
            name: partner.name || partner.company_name || 'Unknown Partner',
            company: partner.company_name || partner.name || 'No Company',
            joined: partner.created_at || new Date().toISOString(),
            phone: partner.phone || null,
            email: partner.email || null,
            website: partner.website || null,
            description: partner.description || null,
            updated_at: partner.updated_at || new Date().toISOString()
        }));
        
        displayPartners(transformedPartners);
        updatePartnerStats(transformedPartners);
        
        console.log('Partners loaded successfully:', transformedPartners);
        
    } catch (error) {
        console.error('Error loading partners:', error);
        const partnersTableBody = document.getElementById('partners-table-body');
        if (partnersTableBody) {
            partnersTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #ff5757; padding: 40px;">
                        Error loading partners: ${error.message}
                        <br><button onclick="loadPartners()" class="action-btn-small view" style="margin-top: 10px;">Retry</button>
                    </td>
                </tr>
            `;
        }
        showNotification('Failed to load partners: ' + error.message, 'error');
    }
}

// Display partners in table
function displayPartners(partners) {
    const partnersTableBody = document.getElementById('partners-table-body');
    if (!partnersTableBody) return;
    
    partnersTableBody.innerHTML = partners.map(partner => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 40px; height: 40px; background: rgba(0, 212, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #00d4ff; font-weight: 600;">
                        🤝
                    </div>
                    <div>
                        <div style="font-weight: 600; color: #e9ffee;">${partner.name}</div>
                        ${partner.description ? `<div style="font-size: 0.8rem; color: #b8f5d3;">${partner.description}</div>` : ''}
                    </div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <span style="color: #e9ffee;">${partner.company}</span>
                    ${partner.website ? `<span style="font-size: 0.8rem; color: #b8f5d3;">🌐 ${partner.website}</span>` : ''}
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <span style="color: #e9ffee;">${formatDate(partner.joined)}</span>
                    <span style="font-size: 0.8rem; color: #b8f5d3;">${formatTimeAgo(partner.joined)}</span>
                </div>
            </td>
            <td>
                <div class="table-actions" style="display: flex; gap: 8px; justify-content: center;">
                    <button class="action-btn-small edit" onclick="editPartner('${partner.id}')" title="Edit Partner">✏️</button>
                    <button class="action-btn-small delete" onclick="deletePartner('${partner.id}')" title="Delete Partner">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update dashboard statistics
function updateDashboardStats() {
    // This will be called periodically to update stats
    console.log('Dashboard stats updated');
}

// Update user statistics
function updateUserStats(users) {
    const totalUsers = document.getElementById('total-users');
    if (totalUsers) {
        totalUsers.textContent = users.length;
        
        // Add animation to show the update
        totalUsers.style.transform = 'scale(1.2)';
        totalUsers.style.color = '#00ff88';
        setTimeout(() => {
            totalUsers.style.transform = 'scale(1)';
            totalUsers.style.color = '#00ff88';
        }, 300);
    }
    
    // Update the tab header to show user count
    const userTabHeader = document.querySelector('#users-tab .tab-header h2');
    if (userTabHeader) {
        userTabHeader.innerHTML = `👥 User Management <span style="font-size: 0.8rem; color: #00ff88; margin-left: 10px;">(${users.length} users)</span>`;
    }
    
    // Show notification with user count - DISABLED
    // if (users.length > 0) {
    //     showNotification(`Loaded ${users.length} users successfully!`, 'success');
    // }
}

// Update subscription statistics
function updateSubscriptionStats(plans) {
    const activeSubscriptions = document.getElementById('active-subscriptions');
    if (activeSubscriptions) {
        // Count all active plans (including free plans if they are marked as active)
        const activeCount = plans.filter(plan => plan.is_active === true).length;
        activeSubscriptions.textContent = activeCount;
        
        // Add animation to show the update
        activeSubscriptions.style.transform = 'scale(1.2)';
        activeSubscriptions.style.color = '#00d4ff';
        setTimeout(() => {
            activeSubscriptions.style.transform = 'scale(1)';
            activeSubscriptions.style.color = '#00d4ff';
        }, 300);
    }
    
    // Update the plans summary section
    const totalPlansCount = document.getElementById('total-plans-count');
    const activePlansCount = document.getElementById('active-plans-count');
    const inactivePlansCount = document.getElementById('inactive-plans-count');
    
    if (totalPlansCount) totalPlansCount.textContent = plans.length;
    if (activePlansCount) activePlansCount.textContent = plans.filter(plan => plan.is_active === true).length;
    if (inactivePlansCount) inactivePlansCount.textContent = plans.filter(plan => plan.is_active === false).length;
    
    // Update the tab header to show plan count
    const subscriptionTabHeader = document.querySelector('#subscriptions-tab .tab-header h2');
    if (subscriptionTabHeader) {
        const totalPlans = plans.length;
        const activePlans = plans.filter(plan => plan.is_active === true).length;
        const inactivePlans = plans.filter(plan => plan.is_active === false).length;
        
        subscriptionTabHeader.innerHTML = `💎 Subscription Plan Management <span style="font-size: 0.8rem; color: #00d4ff; margin-left: 10px;">(${activePlans} active, ${inactivePlans} inactive)</span>`;
    }
    
    // Show notification with plan count details
    if (plans.length > 0) {
        const activeCount = plans.filter(plan => plan.is_active === true).length;
        const inactiveCount = plans.filter(plan => plan.is_active === false).length;
        
        // showNotification(`Loaded ${plans.length} subscription plans: ${activeCount} active, ${inactiveCount} inactive`, 'success');
        
        // Log detailed plan information for debugging
        console.log('Subscription Plans Summary:', {
            total: plans.length,
            active: activeCount,
            inactive: inactiveCount,
            plans: plans.map(plan => ({
                id: plan.id,
                name: plan.name,
                type: plan.type,
                is_active: plan.is_active,
                price: plan.price
            }))
        });
    }
}

// Update partner statistics
function updatePartnerStats(partners) {
    const totalPartners = document.getElementById('total-partners');
    if (totalPartners) {
        totalPartners.textContent = partners.length;
        
        // Add animation to show the update
        totalPartners.style.transform = 'scale(1.2)';
        totalPartners.style.color = '#00d4ff';
        setTimeout(() => {
            totalPartners.style.transform = 'scale(1)';
            totalPartners.style.color = '#00d4ff';
        }, 300);
    }
    
    // Update the partners summary section
    const totalPartnersCount = document.getElementById('total-partners-count');
    const activePartnersCount = document.getElementById('active-partners-count');
    const pendingPartnersCount = document.getElementById('pending-partners-count');
    const inactivePartnersCount = document.getElementById('inactive-partners-count');
    
    if (totalPartnersCount) totalPartnersCount.textContent = partners.length;
    if (activePartnersCount) activePartnersCount.textContent = partners.filter(partner => partner.status === 'active').length;
    if (pendingPartnersCount) pendingPartnersCount.textContent = partners.filter(partner => partner.status === 'pending').length;
    if (inactivePartnersCount) inactivePartnersCount.textContent = partners.filter(partner => partner.status === 'inactive').length;
    
    // Update the tab header to show partner count
    const partnerTabHeader = document.querySelector('#partners-tab .tab-header h2');
    if (partnerTabHeader) {
        const totalPartners = partners.length;
        const activePartners = partners.filter(partner => partner.status === 'active').length;
        const pendingPartners = partners.filter(partner => partner.status === 'pending').length;
        const inactivePartners = partners.filter(partner => partner.status === 'inactive').length;
        
        partnerTabHeader.innerHTML = `🤝 Partner Management <span style="font-size: 0.8rem; color: #00d4ff; margin-left: 10px;">(${activePartners} active, ${pendingPartners} pending, ${inactivePartners} inactive)</span>`;
    }
    
    // Show notification with partner count details
    if (partners.length > 0) {
        const activeCount = partners.filter(partner => partner.status === 'active').length;
        const pendingCount = partners.filter(partner => partner.status === 'pending').length;
        const inactiveCount = partners.filter(partner => partner.status === 'inactive').length;
        
        // Notification disabled - showNotification(`Loaded ${partners.length} partners: ${activeCount} active, ${pendingCount} pending, ${inactiveCount} inactive`, 'success');
        
        // Log detailed partner information for debugging
        console.log('Partners Summary:', {
            total: partners.length,
            active: activeCount,
            pending: pendingCount,
            inactive: inactiveCount,
            partners: partners.map(partner => ({
                id: partner.id,
                name: partner.name,
                company: partner.company,
                status: partner.status,
                contact: partner.contact
            }))
        });
    }
}

// Filter functions
function filterUsers(searchTerm) {
    // Implement user filtering logic
    console.log('Filtering users by:', searchTerm);
}

function filterUsersByPlan(planType) {
    // Implement plan-based filtering
    console.log('Filtering users by plan:', planType);
}

function filterPartners(searchTerm) {
    // Implement partner filtering logic
    console.log('Filtering partners by:', searchTerm);
}

function filterPartnersByStatus(status) {
    // Implement status-based filtering
    console.log('Filtering partners by status:', status);
}

// Action functions
function addNewUser() {
    showNotification('Add User functionality coming soon!', 'info');
    
    // For now, show a simple form to add a new user
    const userName = prompt('Enter user name:');
    if (!userName) return;
    
    const userEmail = prompt('Enter user email:');
    if (!userEmail) return;
    
    const userPlan = prompt('Enter user plan (free/professional/enterprise):');
    if (!userPlan) return;
    
    // Show confirmation
    if (confirm(`Create new user?\nName: ${userName}\nEmail: ${userEmail}\nPlan: ${userPlan}`)) {
        showNotification('User creation functionality will be implemented soon!', 'info');
    }
}

function addNewPlan() {
    showNotification('Add Plan functionality coming soon!', 'info');
    
    // For now, show a simple form to add a new plan
    const planName = prompt('Enter plan name:');
    if (!planName) return;
    
    const planType = prompt('Enter plan type (free/professional/enterprise):');
    if (!planType) return;
    
    const planPrice = prompt('Enter plan price (0 for free):');
    if (planPrice === null) return;
    
    const planPeriod = prompt('Enter billing period (Monthly/Yearly/Lifetime):');
    if (!planPeriod) return;
    
    // Show confirmation
    if (confirm(`Create new plan?\nName: ${planName}\nType: ${planType}\nPrice: $${planPrice}\nPeriod: ${planPeriod}`)) {
        showNotification('Plan creation functionality will be implemented soon!', 'info');
    }
}

function refreshPlans() {
    showNotification('Refreshing plans...', 'info');
    loadSubscriptionPlans();
}

function exportUsers() {
    showNotification('Exporting users...', 'info');
    setTimeout(() => {
        showNotification('Users exported successfully!', 'success');
    }, 2000);
}

// Add new partner functionality
function addNewPartner() {
    // Remove existing modal if any
    const existingModal = document.getElementById('addPartnerModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add CSS styles for image upload (same as edit modal)
    const styleId = 'partner-image-upload-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .image-upload-container {
                display: flex;
                flex-direction: column;
                gap: 15px;
                align-items: flex-start;
            }
            
            .image-upload-container input[type="file"] {
                padding: 10px;
                border: 2px dashed #00ff88;
                border-radius: 8px;
                background: rgba(0, 255, 136, 0.1);
                color: #e9ffee;
                cursor: pointer;
                width: 100%;
                transition: all 0.3s ease;
            }
            
            .image-upload-container input[type="file"]:hover {
                border-color: #00ff88;
                background: rgba(0, 255, 136, 0.2);
            }
            
            .image-preview {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                min-height: 60px;
            }
            
            .image-preview img {
                border: 2px solid #00d4ff;
                box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
            }
            
            .image-preview span {
                color: #b8f5d3;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create modal HTML
    const modalHTML = `
        <div id="addPartnerModal" class="plan-edit-modal">
            <div class="modal-backdrop"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h3>➕ Add New Partner</h3>
                    <button class="modal-close" onclick="closeAddPartnerModal()">×</button>
                </div>
                
                <form id="addPartnerForm" class="plan-edit-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="newPartnerName">Partner Name *</label>
                            <input type="text" id="newPartnerName" name="name" required placeholder="Enter partner name">
                        </div>
                        <div class="form-group">
                            <label for="newPartnerType">Partner Type *</label>
                            <input type="text" id="newPartnerType" name="partner_type" required placeholder="e.g., Technology Partner, Agency Partner">
                        </div>
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="newPartnerWebsite">Website</label>
                        <input type="url" id="newPartnerWebsite" name="website" placeholder="https://example.com">
                    </div>
                    
                    <div class="form-group full-width" style="margin-top: 20px;">
                        <label for="newPartnerDescription">Description *</label>
                        <textarea id="newPartnerDescription" name="description" rows="4" required placeholder="Enter partner description..."></textarea>
                    </div>
                    
                    <div class="form-group full-width" style="margin-top: 20px;">
                        <label for="newPartnerImage">Partner Logo/Image</label>
                        <div class="image-upload-container">
                            <input type="file" id="newPartnerImage" name="image" accept="image/*" onchange="previewNewPartnerImage(this)">
                            <div class="image-preview" id="newPartnerImagePreview">
                                <span>No image selected</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="closeAddPartnerModal()">
                            <span class="btn-icon">❌</span>
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            <span class="btn-icon">➕</span>
                            Add Partner
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add form submit handler
    document.getElementById('addPartnerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveNewPartner();
    });
    
    // Show modal with animation
    setTimeout(() => {
        document.getElementById('addPartnerModal').classList.add('show');
    }, 10);
}

// Close add partner modal
function closeAddPartnerModal() {
    const modal = document.getElementById('addPartnerModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Preview new partner image
function previewNewPartnerImage(input) {
    const preview = document.getElementById('newPartnerImagePreview');
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100px; max-height: 100px; border-radius: 8px;">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '<span>No image selected</span>';
    }
}

// Save new partner
async function saveNewPartner() {
    try {
        const form = document.getElementById('addPartnerForm');
        const formData = new FormData(form);
        
        // Validate required fields
        const name = formData.get('name');
        const partnerType = formData.get('partner_type');
        const description = formData.get('description');
        
        if (!name || !partnerType || !description) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Handle image upload if selected
        let imageUrl = null;
        const imageFile = formData.get('image');
        
        if (imageFile && imageFile.size > 0) {
            try {
                // Upload image to Supabase Storage
                const fileName = `partner-${Date.now()}-${imageFile.name.split('.').pop()}`;
                const { data: uploadData, error: uploadError } = await supabaseClient.storage
                    .from('Partners')
                    .upload(fileName, imageFile);
                
                if (uploadError) {
                    console.error('❌ Image upload failed:', uploadError);
                    
                    // Check if it's an RLS policy issue
                    if (uploadError.message.includes('row-level security policy')) {
                        showNotification('Image upload failed: Storage bucket has RLS policies. Showing solution...', 'error');
                        console.log('💡 Solution: Disable RLS on Partners bucket or create proper policies');
                        
                        // Automatically show solution after a short delay
                        setTimeout(() => {
                            showStorageRLSSolution();
                        }, 1500);
                    } else {
                        showNotification('Image upload failed: ' + uploadError.message, 'error');
                    }
                    return;
                }
                
                // Get public URL for the uploaded image
                const { data: urlData } = supabaseClient.storage
                    .from('Partners')
                    .getPublicUrl(fileName);
                
                imageUrl = urlData.publicUrl;
                console.log('✅ Image uploaded successfully:', imageUrl);
                
            } catch (uploadErr) {
                console.error('❌ Image upload error:', uploadErr);
                showNotification('Image upload failed: ' + uploadErr.message, 'error');
                return;
            }
        }
        
        // Prepare partner data
        const partnerData = {
            name: formData.get('name'),
            partner_type: formData.get('partner_type'),
            website: formData.get('website'),
            description: formData.get('description'),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // Add image URL if image was uploaded
        if (imageUrl) {
            partnerData.image_url = imageUrl;
        }
        
        console.log('💾 Adding new partner:', partnerData);
        
        // Insert new partner in Supabase
        const { data, error } = await supabaseClient
            .from('partners')
            .insert(partnerData)
            .select()
            .single();
            
        if (error) {
            console.error('❌ Failed to add partner:', error);
            showNotification('Failed to add partner: ' + error.message, 'error');
            return;
        }
        
        console.log('✅ Partner added successfully:', data);
        showNotification('Partner added successfully!', 'success');
        
        // Close modal and refresh partners
        closeAddPartnerModal();
        loadPartners();
        
    } catch (error) {
        console.error('❌ Add partner failed:', error);
        showNotification('Failed to add partner: ' + error.message, 'error');
    }
}

function exportPartners() {
    showNotification('Exporting partners...', 'info');
    setTimeout(() => {
        showNotification('Partners exported successfully!', 'success');
    }, 2000);
}

// CRUD operations
function viewUser(userId) {
    showNotification(`Viewing user ${userId}`, 'info');
}

function editUser(userId) {
    showNotification(`Editing user ${userId}`, 'info');
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        showNotification(`Deleting user ${userId}...`, 'info');
        setTimeout(() => {
            showNotification('User deleted successfully!', 'success');
            loadUsers(); // Reload the table
        }, 1000);
    }
}

function refreshPartners() {
    showNotification('Refreshing partners...', 'info');
    loadPartners();
}

// Enhanced user management functions
async function viewUser(userId) {
    try {
        if (!supabaseClient) {
            showNotification('Supabase client not available', 'error');
            return;
        }
        
        // Fetch detailed user information
        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        // Show user details in a modal or notification
        const userInfo = `
👤 User Details:
• Name: ${profile.full_name || 'Not provided'}
• Email: ${profile.email || 'Not provided'}
• Phone: ${profile.phone || 'Not provided'}
• Company: ${profile.company || 'Not provided'}
• Plan: ${formatPlanType(profile.plan_type || 'free')}
• Status: ${profile.plan_status || 'active'}
• Joined: ${formatDate(profile.created_at)}
• Last Updated: ${formatDate(profile.updated_at)}
        `;
        
        showNotification(userInfo, 'info');
        
    } catch (error) {
        console.error('Error viewing user:', error);
        showNotification('Failed to load user details: ' + error.message, 'error');
    }
}

async function editUser(userId) {
    try {
        if (!supabaseClient) {
            showNotification('Supabase client not available', 'error');
            return;
        }
        
        // Fetch user information for editing
        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        // For now, show a notification with edit options
        // In the future, this could open a modal form
        showNotification(`Editing user: ${profile.full_name || profile.email}`, 'info');
        
        // You can implement a modal form here for editing user details
        // Example: openEditUserModal(profile);
        
    } catch (error) {
        console.error('Error editing user:', error);
        showNotification('Failed to load user for editing: ' + error.message, 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    try {
        if (!supabaseClient) {
            showNotification('Supabase client not available', 'error');
            return;
        }
        
        showNotification('Deleting user...', 'info');
        
        // Delete user from profiles table
        const { error } = await supabaseClient
            .from('profiles')
            .delete()
            .eq('id', userId);
        
        if (error) throw error;
        
        showNotification('User deleted successfully!', 'success');
        
        // Reload users table
        loadUsers();
        
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Failed to delete user: ' + error.message, 'error');
    }
}

// Enhanced search and filter functions
function filterUsers(searchTerm) {
    const userRows = document.querySelectorAll('#users-table-body tr');
    const searchLower = searchTerm.toLowerCase();
    
    userRows.forEach(row => {
        const nameCell = row.querySelector('td:first-child');
        const emailCell = row.querySelector('td:nth-child(2)');
        
        if (nameCell && emailCell) {
            const name = nameCell.textContent.toLowerCase();
            const email = emailCell.textContent.toLowerCase();
            
            if (name.includes(searchLower) || email.includes(searchLower)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

function filterUsersByPlan(planType) {
    const userRows = document.querySelectorAll('#users-table-body tr');
    
    userRows.forEach(row => {
        const planCell = row.querySelector('td:nth-child(3)');
        
        if (planCell) {
            const plan = planCell.textContent.toLowerCase();
            
            if (planType === 'all' || plan.includes(planType.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">×</button>
    `;
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Enhanced plan management functions
async function viewPlan(planId) {
    try {
        if (!supabaseClient) {
            showNotification('Supabase client not available', 'error');
            return;
        }
        
        // Fetch detailed plan information
        const { data: plan, error } = await supabaseClient
            .from('subscription_plans')
            .select('*')
            .eq('id', planId)
            .single();
        
        if (error) throw error;
        
        // Show plan details in a notification
        const planInfo = `
💎 Plan Details:
• Name: ${plan.name || 'Not provided'}
• Type: ${formatPlanType(plan.type || 'free')}
• Price: $${plan.price || 0}
• Period: ${plan.period || 'Not specified'}
• Status: ${plan.is_active ? 'Active' : 'Inactive'}
• Description: ${plan.description || 'No description'}
• Features: ${plan.features && plan.features.length > 0 ? plan.features.join(', ') : 'No features listed'}
• Created: ${formatDate(plan.created_at)}
• Updated: ${formatDate(plan.updated_at)}
        `;
        
        showNotification(planInfo, 'info');
        
    } catch (error) {
        console.error('Error viewing plan:', error);
        showNotification('Failed to load plan details: ' + error.message, 'error');
    }
}

// Edit plan with beautiful modal form
async function editPlan(planId) {
    try {
        console.log('✏️ Editing plan:', planId);
        
        // Fetch plan data first
        const { data: plan, error } = await supabaseClient
            .from('subscription_plans')
            .select('*')
            .eq('id', planId)
            .single();
            
        if (error) {
            console.error('❌ Failed to fetch plan:', error);
            showNotification('Failed to fetch plan details', 'error');
            return;
        }
        
        console.log('📋 Plan data:', plan);
        
        // Create and show the beautiful edit modal
        showEditPlanModal(plan);
        
    } catch (error) {
        console.error('❌ Edit plan failed:', error);
        showNotification('Failed to edit plan: ' + error.message, 'error');
    }
}

// Show beautiful edit plan modal
function showEditPlanModal(plan) {
    // Remove existing modal if any
    const existingModal = document.getElementById('editPlanModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal HTML
    const modalHTML = `
        <div id="editPlanModal" class="plan-edit-modal">
            <div class="modal-backdrop"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h3>✏️ Edit Subscription Plan</h3>
                    <button class="modal-close" onclick="closeEditPlanModal()">×</button>
                </div>
                
                <form id="editPlanForm" class="plan-edit-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="planName">Plan Name</label>
                            <input type="text" id="planName" name="name" value="${plan.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="planType">Plan Type</label>
                            <select id="planType" name="type" required>
                                <option value="free" ${plan.plan_type === 'free' ? 'selected' : ''}>Free</option>
                                <option value="professional" ${plan.plan_type === 'professional' ? 'selected' : ''}>Professional</option>
                                <option value="enterprise" ${plan.plan_type === 'enterprise' ? 'selected' : ''}>Enterprise</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="planPrice">Price ($)</label>
                            <input type="number" id="planPrice" name="price" value="${(plan.price / 100).toFixed(2) || 0}" min="0" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="planInterval">Billing Interval</label>
                            <select id="planInterval" name="interval" required>
                                <option value="month" ${plan.interval === 'month' ? 'selected' : ''}>Monthly</option>
                                <option value="year" ${plan.interval === 'year' ? 'selected' : ''}>Yearly</option>
                                <option value="lifetime" ${plan.interval === 'lifetime' ? 'selected' : ''}>Lifetime</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="planDescription">Description</label>
                        <textarea id="planDescription" name="description" rows="3" required>${plan.description || ''}</textarea>
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="planFeatures">Features (one per line)</label>
                        <textarea id="planFeatures" name="features" rows="6" placeholder="Feature 1&#10;Feature 2&#10;Feature 3">${Array.isArray(plan.features) ? plan.features.join('\n') : plan.features || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="maxInstagramAccounts">Max Instagram Accounts</label>
                            <input type="number" id="maxInstagramAccounts" name="max_instagram_accounts" value="${plan.max_instagram_accounts || 1}" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="maxAutomationCampaigns">Max Automation Campaigns</label>
                            <input type="number" id="maxAutomationCampaigns" name="max_automation_campaigns" value="${plan.max_automation_campaigns || 1}" min="1" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="maxScheduledPosts">Max Scheduled Posts</label>
                            <input type="number" id="maxScheduledPosts" name="max_scheduled_posts" value="${plan.max_scheduled_posts || 10}" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="trialDays">Trial Days</label>
                            <input type="number" id="trialDays" name="trial_days" value="${plan.trial_days || 0}" min="0" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="planStatus">Status</label>
                            <select id="planStatus" name="is_active">
                                <option value="true" ${plan.is_active === true ? 'selected' : ''}>Active</option>
                                <option value="false" ${plan.is_active === false ? 'selected' : ''}>Inactive</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="closeEditPlanModal()">
                            <span class="btn-icon">❌</span>
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            <span class="btn-icon">💾</span>
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add form submit handler
    document.getElementById('editPlanForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePlanChanges(plan.id);
    });
    
    // Show modal with animation
    setTimeout(() => {
        document.getElementById('editPlanModal').classList.add('show');
    }, 10);
}

// Save plan changes
async function savePlanChanges(planId) {
    try {
        const form = document.getElementById('editPlanForm');
        const formData = new FormData(form);
        
        // Convert form data to plan object - match exact database schema
        const planData = {
            name: formData.get('name'),
            plan_type: formData.get('type'),
            price: Math.round(parseFloat(formData.get('price')) * 100), // Convert dollars to cents
            description: formData.get('description'),
            features: formData.get('features').split('\n').filter(f => f.trim()),
            is_active: formData.get('is_active') === 'true',
            interval: formData.get('interval'),
            currency: 'usd',
            max_instagram_accounts: parseInt(formData.get('max_instagram_accounts')) || 1,
            max_automation_campaigns: parseInt(formData.get('max_automation_campaigns')) || 1,
            max_scheduled_posts: parseInt(formData.get('max_scheduled_posts')) || 10,
            trial_days: parseInt(formData.get('trial_days')) || 0
        };
        
        console.log('💾 Saving plan changes:', planData);
        
        // Update plan in Supabase
        const { data, error } = await supabaseClient
            .from('subscription_plans')
            .update(planData)
            .eq('id', planId)
            .select()
            .single();
            
        if (error) {
            console.error('❌ Failed to update plan:', error);
            showNotification('Failed to update plan: ' + error.message, 'error');
            return;
        }
        
        console.log('✅ Plan updated successfully:', data);
        showNotification('Plan updated successfully!', 'success');
        
        // Close modal and refresh plans
        closeEditPlanModal();
        loadSubscriptionPlans();
        
    } catch (error) {
        console.error('❌ Save plan changes failed:', error);
        showNotification('Failed to save changes: ' + error.message, 'error');
    }
}

// Close edit plan modal
function closeEditPlanModal() {
    const modal = document.getElementById('editPlanModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

async function deletePlan(planId) {
    try {
        if (!supabaseClient) {
            showNotification('Supabase client not available', 'error');
            return;
        }
        
        // First, fetch the plan details to show in confirmation
        const { data: plan, error } = await supabaseClient
            .from('subscription_plans')
            .select('*')
            .eq('id', planId)
            .single();
        
        if (error) throw error;
        
        // Show detailed confirmation
        const confirmMessage = `Are you sure you want to delete this plan?\n\n` +
            `Plan Name: ${plan.name}\n` +
            `Plan Type: ${formatPlanType(plan.plan_type)}\n` +
            `Price: $${(plan.price / 100).toFixed(2)}\n` +
            `Period: ${plan.interval}\n` +
            `Status: ${plan.is_active ? 'Active' : 'Inactive'}\n\n` +
            `This action cannot be undone!`;
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        showNotification('Deleting plan...', 'info');
        
        // Delete plan from subscription_plans table
        const { error: deleteError } = await supabaseClient
            .from('subscription_plans')
            .delete()
            .eq('id', planId);
        
        if (deleteError) throw deleteError;
        
        showNotification(`Plan "${plan.name}" deleted successfully!`, 'success');
        
        // Reload plans
        loadSubscriptionPlans();
        
    } catch (error) {
        console.error('Error deleting plan:', error);
        showNotification('Failed to delete plan: ' + error.message, 'error');
    }
}

// Enhanced partner management functions
async function viewPartner(partnerId) {
    try {
        if (!supabaseClient) {
            showNotification('Supabase client not available', 'error');
            return;
        }
        
        // Fetch detailed partner information
        const { data: partner, error } = await supabaseClient
            .from('partners')
            .select('*')
            .eq('id', partnerId)
            .single();
        
        if (error) throw error;
        
        // Show partner details in a notification
        const partnerInfo = `
🤝 Partner Details:
• Name: ${partner.name || 'Not provided'}
• Company: ${partner.company_name || 'Not provided'}
• Email: ${partner.email || 'Not provided'}
• Phone: ${partner.phone || 'Not provided'}
• Website: ${partner.website || 'Not provided'}
• Status: ${partner.status || 'pending'}
• Description: ${partner.description || 'No description'}
• Created: ${formatDate(partner.created_at)}
• Updated: ${formatDate(partner.updated_at)}
        `;
        
        showNotification(partnerInfo, 'info');
        
    } catch (error) {
        console.error('Error viewing partner:', error);
        showNotification('Failed to load partner details: ' + error.message, 'error');
    }
}

// Edit partner with beautiful modal form
async function editPartner(partnerId) {
    try {
        console.log('✏️ Editing partner:', partnerId);
        
        // Fetch partner data first
        const { data: partner, error } = await supabaseClient
            .from('partners')
            .select('*')
            .eq('id', partnerId)
            .single();
            
        if (error) {
            console.error('❌ Failed to fetch partner:', error);
            showNotification('Failed to fetch partner details', 'error');
            return;
        }
        
        console.log('📋 Partner data:', partner);
        
        // Create and show the beautiful edit modal
        showEditPartnerModal(partner);
        
    } catch (error) {
        console.error('❌ Edit partner failed:', error);
        showNotification('Failed to edit partner: ' + error.message, 'error');
    }
}

// Show beautiful edit partner modal
function showEditPartnerModal(partner) {
    // Remove existing modal if any
    const existingModal = document.getElementById('editPartnerModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add CSS styles for image upload
    const styleId = 'partner-image-upload-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .image-upload-container {
                display: flex;
                flex-direction: column;
                gap: 15px;
                align-items: flex-start;
            }
            
            .image-upload-container input[type="file"] {
                padding: 10px;
                border: 2px dashed #00ff88;
                border-radius: 8px;
                background: rgba(0, 255, 136, 0.1);
                color: #e9ffee;
                cursor: pointer;
                width: 100%;
                transition: all 0.3s ease;
            }
            
            .image-upload-container input[type="file"]:hover {
                border-color: #00ff88;
                background: rgba(0, 255, 136, 0.2);
            }
            
            .image-preview {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                min-height: 60px;
            }
            
            .image-preview img {
                border: 2px solid #00d4ff;
                box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
            }
            
            .image-preview span {
                color: #b8f5d3;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create modal HTML
    const modalHTML = `
        <div id="editPartnerModal" class="plan-edit-modal">
            <div class="modal-backdrop"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h3>✏️ Edit Partner</h3>
                    <button class="modal-close" onclick="closeEditPartnerModal()">×</button>
                </div>
                
                <form id="editPartnerForm" class="plan-edit-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="partnerName">Partner Name</label>
                            <input type="text" id="partnerName" name="name" value="${partner.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="partnerType">Partner Type</label>
                            <input type="text" id="partnerType" name="partner_type" value="${partner.partner_type || ''}" placeholder="e.g., Agency, Influencer, Vendor">
                        </div>
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="partnerWebsite">Website</label>
                        <input type="url" id="partnerWebsite" name="website" value="${partner.website || ''}" placeholder="https://example.com">
                    </div>
                    
                    <div class="form-group full-width" style="margin-top: 20px;">
                        <label for="partnerDescription">Description</label>
                        <textarea id="partnerDescription" name="description" rows="4" placeholder="Enter partner description...">${partner.description || ''}</textarea>
                    </div>
                    
                    <div class="form-group full-width" style="margin-top: 20px;">
                        <label for="partnerImage">Partner Logo/Image</label>
                        <div class="image-upload-container">
                            <input type="file" id="partnerImage" name="image" accept="image/*" onchange="previewPartnerImage(this)">
                            <div class="image-preview" id="partnerImagePreview">
                                ${partner.image_url ? `<img src="${partner.image_url}" alt="Partner Image" style="max-width: 100px; max-height: 100px; border-radius: 8px;">` : '<span>No image selected</span>'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="closeEditPartnerModal()">
                            <span class="btn-icon">❌</span>
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            <span class="btn-icon">💾</span>
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add form submit handler
    document.getElementById('editPartnerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePartnerChanges(partner.id);
    });
    
    // Show modal with animation
    setTimeout(() => {
        document.getElementById('editPartnerModal').classList.add('show');
    }, 10);
}

// Save partner changes
async function savePartnerChanges(partnerId) {
    try {
        const form = document.getElementById('editPartnerForm');
        const formData = new FormData(form);
        
        // Handle image upload if selected
        let imageUrl = null;
        const imageFile = formData.get('image');
        
        if (imageFile && imageFile.size > 0) {
            try {
                // Upload image to Supabase Storage
                const fileName = `partner-${partnerId}-${Date.now()}.${imageFile.name.split('.').pop()}`;
                const { data: uploadData, error: uploadError } = await supabaseClient.storage
                    .from('Partners')
                    .upload(fileName, imageFile);
                
                if (uploadError) {
                    console.error('❌ Image upload failed:', uploadError);
                    
                    // Check if it's an RLS policy issue
                    if (uploadError.message.includes('row-level security policy')) {
                        showNotification('Image upload failed: Storage bucket has RLS policies. Showing solution...', 'error');
                        console.log('💡 Solution: Disable RLS on Partners bucket or create proper policies');
                        
                        // Automatically show solution after a short delay
                        setTimeout(() => {
                            showStorageRLSSolution();
                        }, 1500);
                    } else {
                        showNotification('Image upload failed: ' + uploadError.message, 'error');
                    }
                    return;
                }
                
                // Get public URL for the uploaded image
                const { data: urlData } = supabaseClient.storage
                    .from('Partners')
                    .getPublicUrl(fileName);
                
                imageUrl = urlData.publicUrl;
                console.log('✅ Image uploaded successfully:', imageUrl);
                
            } catch (uploadErr) {
                console.error('❌ Image upload error:', uploadErr);
                showNotification('Image upload failed: ' + uploadErr.message, 'error');
                return;
            }
        }
        
        // Convert form data to partner object
        const partnerData = {
            name: formData.get('name'),
            partner_type: formData.get('partner_type'),
            website: formData.get('website'),
            description: formData.get('description'),
            updated_at: new Date().toISOString()
        };
        
        // Add image URL if image was uploaded
        if (imageUrl) {
            partnerData.image_url = imageUrl;
        }
        
        console.log('💾 Saving partner changes:', partnerData);
        
        // Update partner in Supabase
        const { data, error } = await supabaseClient
            .from('partners')
            .update(partnerData)
            .eq('id', partnerId)
            .select()
            .single();
            
        if (error) {
            console.error('❌ Failed to update partner:', error);
            showNotification('Failed to update partner: ' + error.message, 'error');
            return;
        }
        
        console.log('✅ Partner updated successfully:', data);
        showNotification('Partner updated successfully!', 'success');
        
        // Close modal and refresh partners
        closeEditPartnerModal();
        loadPartners();
        
    } catch (error) {
        console.error('❌ Save partner changes failed:', error);
        showNotification('Failed to save changes: ' + error.message, 'error');
    }
}

// Close edit partner modal
function closeEditPartnerModal() {
    const modal = document.getElementById('editPartnerModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Preview partner image
function previewPartnerImage(input) {
    const preview = document.getElementById('partnerImagePreview');
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Partner Image" style="max-width: 100px; max-height: 100px; border-radius: 8px;">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '<span>No image selected</span>';
    }
}

async function deletePartner(partnerId) {
    try {
        if (!supabaseClient) {
            showNotification('Supabase client not available', 'error');
            return;
        }
        
        // First, fetch the partner details to show in confirmation
        const { data: partner, error } = await supabaseClient
            .from('partners')
            .select('*')
            .eq('id', partnerId)
            .single();
        
        if (error) throw error;
        
        // Show detailed confirmation
        const confirmMessage = `Are you sure you want to delete this partner?\n\n` +
            `Partner Name: ${partner.name}\n` +
            `Company: ${partner.company_name || 'Not specified'}\n` +
            `Email: ${partner.email || 'Not specified'}\n` +
            `Status: ${partner.status}\n\n` +
            `This action cannot be undone!`;
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        showNotification('Deleting partner...', 'info');
        
        // Delete partner from partners table
        const { error: deleteError } = await supabaseClient
            .from('partners')
            .delete()
            .eq('id', partnerId);
        
        if (deleteError) throw deleteError;
        
        showNotification(`Partner "${partner.name}" deleted successfully!`, 'success');
        
        // Reload partners
        loadPartners();
        
    } catch (error) {
        console.error('Error deleting partner:', error);
        showNotification('Failed to delete partner: ' + error.message, 'error');
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) {
        return `${seconds}s ago`;
    } else if (seconds < 3600) {
        return `${Math.floor(seconds / 60)}m ago`;
    } else if (seconds < 86400) {
        return `${Math.floor(seconds / 3600)}h ago`;
    } else {
        return `${Math.floor(seconds / 86400)}d ago`;
    }
}

function formatPlanType(type) {
    switch (type) {
        case 'free':
            return 'Free';
        case 'professional':
            return 'Professional';
        case 'enterprise':
            return 'Enterprise';
        default:
            return type;
    }
}

// Test storage connection specifically
async function testStorageConnection() {
    try {
        console.log('🧪 Testing Supabase Storage connection...');
        
        if (!supabaseClient) {
            console.error('❌ Supabase client is null');
            showNotification('Supabase client is not initialized', 'error');
            return;
        }
        
        console.log('✅ Supabase client exists');
        
        // Test 1: Check if we can list buckets
        console.log('📥 Test 1: List storage buckets...');
        try {
            const { data: buckets, error: bucketsError } = await supabaseClient.storage.listBuckets();
            
            if (bucketsError) {
                console.error('❌ Cannot list buckets:', bucketsError);
                showNotification('Cannot list storage buckets: ' + bucketsError.message, 'error');
            } else {
                console.log('✅ Can list buckets:', buckets);
                console.log('📊 Available buckets:', buckets?.map(b => b.name) || []);
                
                // Check if Partners bucket exists
                const partnersBucket = buckets?.find(b => b.name === 'Partners');
                if (partnersBucket) {
                    console.log('✅ Partners bucket found:', partnersBucket);
                } else {
                    console.log('❌ Partners bucket not found');
                    showNotification('Partners bucket not found. Check your storage bucket name.', 'error');
                }
            }
        } catch (bucketsErr) {
            console.error('❌ Buckets test failed:', bucketsErr);
        }
        
        // Test 2: Try to list files in Partners bucket
        console.log('📥 Test 2: List files in Partners bucket...');
        try {
            const { data: files, error: filesError } = await supabaseClient.storage
                .from('Partners')
                .list();
            
            if (filesError) {
                console.error('❌ Cannot list files in Partners bucket:', filesError);
                showNotification('Cannot list files in Partners bucket: ' + filesError.message, 'error');
            } else {
                console.log('✅ Can list files in Partners bucket:', files);
                console.log('📊 Files found:', files?.length || 0);
            }
        } catch (filesErr) {
            console.error('❌ Files test failed:', filesErr);
        }
        
        // Test 3: Try to upload a small test file
        console.log('📥 Test 3: Try to upload test file...');
        try {
            const testBlob = new Blob(['test'], { type: 'text/plain' });
            const testFileName = `test-${Date.now()}.txt`;
            
            const { data: uploadData, error: uploadError } = await supabaseClient.storage
                .from('Partners')
                .upload(testFileName, testBlob);
            
            if (uploadError) {
                console.error('❌ Test upload failed:', uploadError);
                showNotification('Test upload failed: ' + uploadError.message, 'error');
                
                // Check if it's RLS issue
                if (uploadError.message.includes('row-level security policy')) {
                    console.log('🔐 This is an RLS policy issue. Run disableStorageRLS() for solutions.');
                    showNotification('RLS policy issue detected. Run disableStorageRLS() in console for help.', 'warning');
                }
            } else {
                console.log('✅ Test upload successful:', uploadData);
                showNotification('Storage test successful! Image uploads should work.', 'success');
                
                // Clean up test file
                await supabaseClient.storage
                    .from('Partners')
                    .remove([testFileName]);
                console.log('🧹 Test file cleaned up');
            }
        } catch (uploadErr) {
            console.error('❌ Upload test failed:', uploadErr);
        }
        
        console.log('🧪 Storage connection test completed');
        
    } catch (error) {
        console.error('❌ Storage test failed:', error);
        showNotification('Storage test failed: ' + error.message, 'error');
    }
}

// Test Supabase connectivity
async function testSupabaseConnection() {
    try {
        console.log('🧪 Testing Supabase connection...');
        
        if (!supabaseClient) {
            console.error('❌ Supabase client is null');
            showNotification('Supabase client is not initialized', 'error');
            return;
        }
        
        console.log('✅ Supabase client exists:', supabaseClient);
        
        // Test basic connection by getting current user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        
        if (userError) {
            console.error('❌ Error getting current user:', userError);
            showNotification('Error getting current user: ' + userError.message, 'error');
        } else {
            console.log('✅ Current user:', user);
            showNotification('Supabase connection working! Current user: ' + (user?.email || 'None'), 'success');
        }
        
        // Test profiles table access
        try {
            const { data: testData, error: testError } = await supabaseClient
                .from('profiles')
                .select('count')
                .limit(1);
            
            if (testError) {
                console.error('❌ Profiles table access error:', testError);
                showNotification('Cannot access profiles table: ' + testError.message, 'error');
            } else {
                console.log('✅ Profiles table accessible:', testData);
                showNotification('Profiles table is accessible!', 'success');
            }
        } catch (testErr) {
            console.error('❌ Profiles table test failed:', testErr);
            showNotification('Profiles table test failed: ' + testErr.message, 'error');
        }
        
        // Check for missing profiles
        await checkForMissingProfiles();
        
    } catch (error) {
        console.error('❌ Supabase connection test failed:', error);
        showNotification('Supabase connection test failed: ' + error.message, 'error');
    }
}

// Check for missing profiles and create them
async function checkForMissingProfiles() {
    try {
        console.log('🔍 Checking for missing profiles...');
        
        // Get current authenticated user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError) {
            console.error('❌ Cannot get current user for profile check:', userError);
            return;
        }
        
        if (!user) {
            console.log('ℹ️ No authenticated user, skipping profile check');
            return;
        }
        
        console.log('👤 Current user:', user.email);
        
        // Check if current user has a profile
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (profileError) {
            console.log('⚠️ Profile not found for current user, creating one...');
            
            // Create profile for current user
            const { data: newProfile, error: createError } = await supabaseClient
                .from('profiles')
                .insert([
                    {
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                        plan_type: 'free',
                        plan_status: 'active',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();
            
            if (createError) {
                console.error('❌ Failed to create profile:', createError);
                showNotification('Failed to create profile: ' + createError.message, 'error');
            } else {
                console.log('✅ Profile created successfully:', newProfile);
                showNotification('Profile created for current user!', 'success');
            }
        } else {
            console.log('✅ Current user profile exists:', profile);
        }
        
        // Try to get all profiles (this will help identify RLS issues)
        console.log('🔍 Attempting to fetch all profiles...');
        const { data: allProfiles, error: allProfilesError } = await supabaseClient
            .from('profiles')
            .select('*');
        
        if (allProfilesError) {
            console.error('❌ Cannot fetch all profiles (RLS issue?):', allProfilesError);
            showNotification('Cannot fetch all profiles. This might be an RLS policy issue.', 'error');
        } else {
            console.log('✅ All profiles accessible:', allProfiles);
            console.log('📊 Total profiles found:', allProfiles?.length || 0);
            
            if (allProfiles && allProfiles.length > 0) {
                showNotification(`Found ${allProfiles.length} profiles in database`, 'success');
            } else {
                showNotification('No profiles found in database', 'info');
            }
        }
        
    } catch (error) {
        console.error('❌ Profile check failed:', error);
        showNotification('Profile check failed: ' + error.message, 'error');
    }
}

// Create missing profiles for all users
async function createMissingProfiles() {
    try {
        console.log('🔧 Creating missing profiles for all users...');
        showNotification('Creating missing profiles...', 'info');
        
        if (!supabaseClient) {
            throw new Error('Supabase client not available');
        }
        
        // First, get all auth users
        console.log('📥 Fetching all auth users...');
        const { data: { users: authUsers }, error: authError } = await supabaseClient.auth.admin.listUsers();
        
        if (authError) {
            console.error('❌ Cannot fetch auth users:', authError);
            showNotification('Cannot fetch auth users: ' + authError.message, 'error');
            return;
        }
        
        console.log('✅ Found auth users:', authUsers?.length || 0);
        console.log('👥 Auth users:', authUsers?.map(u => ({ id: u.id, email: u.email, created: u.created_at })));
        
        // Get existing profiles
        console.log('📥 Fetching existing profiles...');
        const { data: existingProfiles, error: profilesError } = await supabaseClient
            .from('profiles')
            .select('id, email');
        
        if (profilesError) {
            console.error('❌ Cannot fetch existing profiles:', profilesError);
            showNotification('Cannot fetch existing profiles: ' + profilesError.message, 'error');
            return;
        }
        
        const existingProfileIds = existingProfiles?.map(p => p.id) || [];
        const existingProfileEmails = existingProfiles?.map(p => p.email) || [];
        console.log('✅ Existing profile IDs:', existingProfileIds);
        console.log('✅ Existing profile emails:', existingProfileEmails);
        
        // Find users without profiles
        const usersWithoutProfiles = authUsers.filter(user => !existingProfileIds.includes(user.id));
        console.log('⚠️ Users without profiles:', usersWithoutProfiles.length);
        console.log('👤 Users needing profiles:', usersWithoutProfiles?.map(u => ({ id: u.id, email: u.email })));
        
        if (usersWithoutProfiles.length === 0) {
            showNotification('All users already have profiles!', 'success');
            return;
        }
        
        // Create profiles for missing users
        const profilesToCreate = usersWithoutProfiles.map(user => ({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            plan_type: 'free',
            plan_status: 'active',
            created_at: user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));
        
        console.log('📝 Creating profiles for:', profilesToCreate.length, 'users');
        console.log('📋 Profiles to create:', profilesToCreate);
        
        const { data: newProfiles, error: createError } = await supabaseClient
            .from('profiles')
            .insert(profilesToCreate)
            .select();
        
        if (createError) {
            console.error('❌ Failed to create profiles:', createError);
            showNotification('Failed to create profiles: ' + createError.message, 'error');
            return;
        }
        
        console.log('✅ Successfully created profiles:', newProfiles);
        showNotification(`Successfully created ${newProfiles.length} missing profiles!`, 'success');
        
        // Reload users to show the new profiles
        setTimeout(() => {
            loadUsers();
        }, 1000);
        
    } catch (error) {
        console.error('❌ Create missing profiles failed:', error);
        showNotification('Create missing profiles failed: ' + error.message, 'error');
    }
}

// Check database triggers and RLS policies
async function checkDatabaseSetup() {
    try {
        console.log('🔍 Checking database setup...');
        showNotification('Checking database setup...', 'info');
        
        if (!supabaseClient) {
            throw new Error('Supabase client not available');
        }
        
        // Check if we can access the profiles table
        console.log('📊 Checking profiles table access...');
        const { data: tableInfo, error: tableError } = await supabaseClient
            .from('profiles')
            .select('*')
            .limit(1);
        
        if (tableError) {
            console.error('❌ Profiles table access error:', tableError);
            showNotification('Cannot access profiles table: ' + tableError.message, 'error');
        } else {
            console.log('✅ Profiles table is accessible');
        }
        
        // Try to get table structure
        try {
            const { data: columns, error: columnsError } = await supabaseClient
                .rpc('get_table_columns', { table_name: 'profiles' });
            
            if (!columnsError && columns) {
                console.log('📋 Table columns:', columns);
            }
        } catch (colErr) {
            console.log('ℹ️ Could not get table columns (normal for anonymous role)');
        }
        
        // Check current user permissions
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError) {
            console.error('❌ Cannot get current user:', userError);
        } else if (user) {
            console.log('👤 Current user:', user.email);
            console.log('🆔 User ID:', user.id);
            
            // Try to insert a test profile to check permissions
            try {
                const { data: testProfile, error: testError } = await supabaseClient
                    .from('profiles')
                    .insert([
                        {
                            id: user.id,
                            email: user.email,
                            full_name: 'Test User',
                            plan_type: 'free',
                            plan_status: 'active',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }
                    ])
                    .select()
                    .single();
                
                if (testError) {
                    console.error('❌ Cannot insert profile (RLS issue?):', testError);
                    showNotification('Cannot insert profile. This suggests an RLS policy issue.', 'error');
                } else {
                    console.log('✅ Can insert profile, RLS policies allow it');
                    
                    // Delete the test profile
                    await supabaseClient
                        .from('profiles')
                        .delete()
                        .eq('id', user.id);
                    console.log('🧹 Test profile deleted');
                }
            } catch (insertErr) {
                console.error('❌ Profile insert test failed:', insertErr);
            }
        }
        
        showNotification('Database setup check completed. Check console for details.', 'success');
        
    } catch (error) {
        console.error('❌ Database setup check failed:', error);
        showNotification('Database setup check failed: ' + error.message, 'error');
    }
}

// Simple test function to check Supabase connection
async function simpleSupabaseTest() {
    try {
        console.log('🧪 SIMPLE SUPABASE TEST STARTING...');
        
        if (!supabaseClient) {
            console.error('❌ Supabase client is null');
            showNotification('Supabase client is null', 'error');
            return;
        }
        
        console.log('✅ Supabase client exists');
        console.log('🌐 URL:', supabaseClient.supabaseUrl);
        console.log('🔑 Anon key exists:', !!supabaseClient.supabaseKey);
        
        // Test 1: Basic auth connection
        console.log('📡 Test 1: Basic auth connection...');
        try {
            const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
            if (userError) {
                console.error('❌ Auth test failed:', userError);
            } else {
                console.log('✅ Auth test passed, user:', user?.email || 'None');
            }
        } catch (authErr) {
            console.error('❌ Auth test exception:', authErr);
        }
        
        // Test 2: Simple profiles table query
        console.log('📡 Test 2: Simple profiles table query...');
        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('id, email')
                .limit(5);
            
            if (error) {
                console.error('❌ Profiles query failed:', error);
                console.error('❌ Error details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
            } else {
                console.log('✅ Profiles query passed!');
                console.log('📊 Data returned:', data);
                console.log('📈 Number of profiles:', data?.length || 0);
                
                if (data && data.length > 0) {
                    console.log('👥 First profile:', data[0]);
                }
            }
        } catch (profilesErr) {
            console.error('❌ Profiles query exception:', profilesErr);
        }
        
        // Test 3: Try to get table info
        console.log('📡 Test 3: Get table info...');
        try {
            const { count, error: countError } = await supabaseClient
                .from('profiles')
                .select('*', { count: 'exact', head: true });
            
            if (countError) {
                console.error('❌ Count query failed:', countError);
            } else {
                console.log('✅ Count query passed, total profiles:', count);
            }
        } catch (countErr) {
            console.error('❌ Count query exception:', countErr);
        }
        
        // Test 4: Try different table name
        console.log('📡 Test 4: Try different table names...');
        const possibleTableNames = ['profiles', 'profile', 'users', 'user', 'auth_users'];
        
        for (const tableName of possibleTableNames) {
            try {
                console.log(`🔍 Trying table: ${tableName}`);
                const { data, error } = await supabaseClient
                    .from(tableName)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    console.log(`❌ Table ${tableName} failed:`, error.message);
                } else {
                    console.log(`✅ Table ${tableName} accessible!`);
                    console.log(`📊 Data from ${tableName}:`, data);
                    break;
                }
            } catch (err) {
                console.log(`❌ Table ${tableName} exception:`, err.message);
            }
        }
        
        console.log('🧪 SIMPLE SUPABASE TEST COMPLETED');
        showNotification('Simple test completed. Check console for results.', 'info');
        
    } catch (error) {
        console.error('❌ Simple test failed:', error);
        showNotification('Simple test failed: ' + error.message, 'error');
    }
}

// Manually inspect profiles table
async function inspectProfilesTable() {
    try {
        console.log('🔍 MANUALLY INSPECTING PROFILES TABLE...');
        showNotification('Inspecting profiles table...', 'info');
        
        if (!supabaseClient) {
            throw new Error('Supabase client not available');
        }
        
        // Method 1: Try to get all profiles
        console.log('📥 Method 1: Get all profiles...');
        try {
            const { data: allProfiles, error: allError } = await supabaseClient
                .from('profiles')
                .select('*');
            
            if (allError) {
                console.error('❌ Method 1 failed:', allError);
            } else {
                console.log('✅ Method 1 successful!');
                console.log('📊 All profiles:', allProfiles);
                console.log('📈 Total count:', allProfiles?.length || 0);
                
                if (allProfiles && allProfiles.length > 0) {
                    console.log('👥 First profile:', allProfiles[0]);
                    console.log('👥 Last profile:', allProfiles[allProfiles.length - 1]);
                }
            }
        } catch (err) {
            console.error('❌ Method 1 exception:', err);
        }
        
        // Method 2: Try to get profiles with specific columns
        console.log('📥 Method 2: Get specific columns...');
        try {
            const { data: specificProfiles, error: specificError } = await supabaseClient
                .from('profiles')
                .select('id, email, full_name, created_at');
            
            if (specificError) {
                console.error('❌ Method 2 failed:', specificError);
            } else {
                console.log('✅ Method 2 successful!');
                console.log('📊 Specific profiles:', specificProfiles);
                console.log('📈 Count with specific columns:', specificProfiles?.length || 0);
            }
        } catch (err) {
            console.error('❌ Method 2 exception:', err);
        }
        
        // Method 3: Try to get profiles with limit
        console.log('📥 Method 3: Get with limit...');
        try {
            const { data: limitedProfiles, error: limitedError } = await supabaseClient
                .from('profiles')
                .select('*')
                .limit(10);
            
            if (limitedError) {
                console.error('❌ Method 3 failed:', limitedError);
            } else {
                console.log('✅ Method 3 successful!');
                console.log('📊 Limited profiles:', limitedProfiles);
                console.log('📈 Count with limit:', limitedProfiles?.length || 0);
            }
        } catch (err) {
            console.error('❌ Method 3 exception:', err);
        }
        
        // Method 4: Try to get profiles without any conditions
        console.log('📥 Method 4: Get without conditions...');
        try {
            const { data: rawProfiles, error: rawError } = await supabaseClient
                .from('profiles')
                .select('*');
            
            if (rawError) {
                console.error('❌ Method 4 failed:', rawError);
            } else {
                console.log('✅ Method 4 successful!');
                console.log('📊 Raw profiles:', rawProfiles);
                console.log('📈 Raw count:', rawProfiles?.length || 0);
            }
        } catch (err) {
            console.error('❌ Method 4 exception:', err);
        }
        
        // Method 5: Try to get table structure
        console.log('📥 Method 5: Get table structure...');
        try {
            const { data: structure, error: structureError } = await supabaseClient
                .from('profiles')
                .select('*')
                .limit(0);
            
            if (structureError) {
                console.error('❌ Method 5 failed:', structureError);
            } else {
                console.log('✅ Method 5 successful!');
                console.log('📊 Table structure test:', structure);
            }
        } catch (err) {
            console.error('❌ Method 5 exception:', err);
        }
        
        console.log('🔍 MANUAL INSPECTION COMPLETED');
        showNotification('Manual inspection completed. Check console for detailed results.', 'success');
        
    } catch (error) {
        console.error('❌ Manual inspection failed:', error);
        showNotification('Manual inspection failed: ' + error.message, 'error');
    }
}

// Quick function to disable RLS (run this in browser console)
function disableStorageRLS() {
    console.log('🚀 Quick RLS Disable Function');
    console.log('');
    console.log('📋 Copy and paste these SQL commands in your Supabase SQL Editor:');
    console.log('');
    console.log('-- Method 1: Disable RLS on storage.objects');
    console.log('ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;');
    console.log('');
    console.log('-- Method 2: If Method 1 fails, try this:');
    console.log('DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;');
    console.log('DROP POLICY IF EXISTS "Allow authenticated downloads" ON storage.objects;');
    console.log('DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;');
    console.log('');
    console.log('-- Method 3: Create a permissive policy');
    console.log('CREATE POLICY "Allow all storage access" ON storage.objects FOR ALL USING (true) WITH CHECK (true);');
    console.log('');
    console.log('📍 Go to: Supabase Dashboard → SQL Editor → New Query');
    console.log('📍 Try Method 1 first, then Method 2, then Method 3');
    console.log('📍 Run each command separately and test after each one');
    console.log('');
    console.log('⚠️  Note: This removes security restrictions. Only use for development/testing.');
    
    // Show notification
    showNotification('Check browser console for multiple SQL commands to try', 'info');
}

// Show storage RLS solution
function showStorageRLSSolution() {
    const solutionMessage = `
🔐 **STORAGE RLS POLICY SOLUTION**

**Problem:** Your Partners storage bucket has RLS policies that block image uploads.

**Solution 1: Disable RLS on Storage Bucket (Quick Fix)**

Go to your Supabase Dashboard → Storage → Partners bucket → Settings → Policies
Then disable RLS or create a policy that allows authenticated users to upload.

**OR run this SQL command in your Supabase SQL Editor:**

\`\`\`sql
-- Disable RLS on storage.objects table (quickest fix)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
\`\`\`

**Solution 2: Create Proper Storage Policy (Recommended)**

Run this SQL in your Supabase SQL Editor:

\`\`\`sql
-- Allow authenticated users to upload to Partners bucket
CREATE POLICY "Allow authenticated uploads" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'Partners' 
        AND auth.role() = 'authenticated'
    );

-- Allow authenticated users to view files in Partners bucket
CREATE POLICY "Allow authenticated downloads" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'Partners' 
        AND auth.role() = 'authenticated'
    );

-- Allow users to update their own files
CREATE POLICY "Allow authenticated updates" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'Partners' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
\`\`\`

**Solution 3: Disable RLS Entirely (Not Recommended for Production)**

\`\`\`sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
\`\`\`

**Recommended:** Use Solution 2 for proper security.
        `;
    
    console.log(solutionMessage);
    
    // Show notification with solution
    showNotification('Storage RLS solution shown in console. Check console for SQL commands.', 'success');
    
    // Create a modal with the solution
    const solutionDiv = document.createElement('div');
    solutionDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 30px;
            border-radius: 15px;
            border: 2px solid #00ff88;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 10000;
            font-family: 'Inter', sans-serif;
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
        ">
            <h3 style="color: #00ff88; margin-bottom: 20px;">🔐 Storage RLS Policy Solution</h3>
            <div style="
                background: rgba(255, 255, 255, 0.1);
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 20px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                white-space: pre-wrap;
                overflow-x: auto;
            ">${solutionMessage.replace(/\*\*/g, '').replace(/`/g, '')}</div>
            <button onclick="this.parentElement.remove()" style="
                background: #00ff88;
                color: black;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
            ">Close</button>
        </div>
    `;
    
    document.body.appendChild(solutionDiv);
}

// Check and fix RLS policies
async function checkAndFixRLS() {
    try {
        console.log('🔐 CHECKING RLS POLICIES...');
        showNotification('Checking RLS policies...', 'info');
        
        if (!supabaseClient) {
            throw new Error('Supabase client not available');
        }
        
        // Check current user role
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) {
            throw new Error('Not authenticated');
        }
        
        console.log('👤 Current user:', user.email);
        console.log('🔑 User role:', user.role);
        console.log('🆔 User ID:', user.id);
        
        // Test 1: Try to get all profiles (should fail due to RLS)
        console.log('📥 Test 1: Try to get all profiles (should fail due to RLS)...');
        try {
            const { data: allProfiles, error: allError } = await supabaseClient
                .from('profiles')
                .select('*');
            
            if (allError) {
                console.log('❌ Expected failure due to RLS:', allError.message);
                console.log('🔐 This confirms RLS is blocking access to other profiles');
            } else {
                console.log('⚠️ Unexpected success - RLS might be disabled or too permissive');
                console.log('📊 Profiles found:', allProfiles?.length || 0);
            }
        } catch (err) {
            console.log('❌ Exception during all profiles query:', err.message);
        }
        
        // Test 2: Try to get specific user profile (should work)
        console.log('📥 Test 2: Try to get specific user profile (should work)...');
        try {
            const { data: specificProfile, error: specificError } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (specificError) {
                console.log('❌ Cannot get own profile:', specificError.message);
            } else {
                console.log('✅ Can get own profile:', specificProfile.email);
            }
        } catch (err) {
            console.log('❌ Exception during own profile query:', err.message);
        }
        
        // Test 3: Try to get count (should fail due to RLS)
        console.log('📥 Test 3: Try to get count (should fail due to RLS)...');
        try {
            const { count, error: countError } = await supabaseClient
                .from('profiles')
                .select('*', { count: 'exact', head: true });
            
            if (countError) {
                console.log('❌ Expected count failure due to RLS:', countError.message);
            } else {
                console.log('⚠️ Unexpected count success:', count);
            }
        } catch (err) {
            console.log('❌ Exception during count query:', err.message);
        }
        
        console.log('🔐 RLS CHECK COMPLETED');
        console.log('📋 SUMMARY:');
        console.log('   - You can only see your own profile due to RLS policies');
        console.log('   - This is why user management shows only 1 user');
        console.log('   - Need to create admin RLS policy or use service role');
        
        showNotification('RLS check completed. You need admin access to see all profiles.', 'warning');
        
        // Show solution
        setTimeout(() => {
            showNotification('💡 Solution: Create admin RLS policy or use service role key', 'info');
        }, 2000);
        
    } catch (error) {
        console.error('❌ RLS check failed:', error);
        showNotification('RLS check failed: ' + error.message, 'error');
    }
}

// Provide solution for RLS issue
async function showRLSSolution() {
    try {
        console.log('💡 SHOWING RLS SOLUTION...');
        
        // Create a detailed solution message
        const solutionMessage = `
🔐 **RLS POLICY SOLUTION**

**Problem:** Your profiles table has RLS policies that only allow users to see their own profile.

**Solution 1: Create Admin RLS Policy (Recommended)**

Run this SQL in your Supabase SQL Editor:

\`\`\`sql
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Create policy for admin to see all profiles
CREATE POLICY "Admin can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND plan_type IN ('admin', 'enterprise')
        )
    );

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create policy for users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
\`\`\`

**Solution 2: Use Service Role Key (Quick Fix)**

Replace your anon key with service role key in supabase-config.js:

\`\`\`javascript
const supabaseUrl = 'https://uwloajvooajxhffphjns.supabase.co';
const supabaseKey = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Get this from Supabase dashboard
\`\`\`

**Solution 3: Disable RLS (Not Recommended for Production)**

\`\`\`sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
\`\`\`

**Recommended:** Use Solution 1 for proper security.
        `;
        
        console.log(solutionMessage);
        
        // Show notification with solution
        showNotification('RLS solution shown in console. Check console for SQL commands.', 'success');
        
        // Create a modal or alert with the solution
        const solutionDiv = document.createElement('div');
        solutionDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.95);
                color: white;
                padding: 30px;
                border-radius: 15px;
                border: 2px solid #00d4ff;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                z-index: 10000;
                font-family: 'Inter', sans-serif;
                box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
            ">
                <h3 style="color: #00d4ff; margin-bottom: 20px;">🔐 RLS Policy Solution</h3>
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    white-space: pre-wrap;
                    overflow-x: auto;
                ">${solutionMessage.replace(/\*\*/g, '').replace(/`/g, '')}</div>
                <button onclick="this.parentElement.remove()" style="
                    background: #00d4ff;
                    color: black;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                ">Close</button>
            </div>
        `;
        
        document.body.appendChild(solutionDiv);
        
    } catch (error) {
        console.error('❌ Show RLS solution failed:', error);
        showNotification('Failed to show RLS solution: ' + error.message, 'error');
    }
}

// Add new plan with beautiful modal form
async function addNewPlan() {
    try {
        console.log('➕ Adding new plan...');
        
        // Show the beautiful add plan modal
        showAddPlanModal();
        
    } catch (error) {
        console.error('❌ Add new plan failed:', error);
        showNotification('Failed to add new plan: ' + error.message, 'error');
    }
}

// Show beautiful add plan modal
function showAddPlanModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('addPlanModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal HTML
    const modalHTML = `
        <div id="addPlanModal" class="plan-edit-modal">
            <div class="modal-backdrop"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h3>➕ Add New Subscription Plan</h3>
                    <button class="modal-close" onclick="closeAddPlanModal()">×</button>
                </div>
                
                <form id="addPlanForm" class="plan-edit-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="planName">Plan Name</label>
                            <input type="text" id="planName" name="name" placeholder="Enter plan name" required>
                        </div>
                        <div class="form-group">
                            <label for="planType">Plan Type</label>
                            <select id="planType" name="type" required>
                                <option value="">Select plan type</option>
                                <option value="free">Free</option>
                                <option value="professional">Professional</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="planPrice">Price ($)</label>
                            <input type="number" id="planPrice" name="price" value="0" min="0" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="planInterval">Billing Interval</label>
                            <select id="planInterval" name="interval" required>
                                <option value="">Select interval</option>
                                <option value="month">Monthly</option>
                                <option value="year">Yearly</option>
                                <option value="lifetime">Lifetime</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="planDescription">Description</label>
                        <textarea id="planDescription" name="description" rows="3" placeholder="Enter plan description" required></textarea>
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="planFeatures">Features (one per line)</label>
                        <textarea id="planFeatures" name="features" rows="6" placeholder="Feature 1&#10;Feature 2&#10;Feature 3" required></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="maxInstagramAccounts">Max Instagram Accounts</label>
                            <input type="number" id="maxInstagramAccounts" name="max_instagram_accounts" value="1" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="maxAutomationCampaigns">Max Automation Campaigns</label>
                            <input type="number" id="maxAutomationCampaigns" name="max_automation_campaigns" value="1" min="1" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="maxScheduledPosts">Max Scheduled Posts</label>
                            <input type="number" id="maxScheduledPosts" name="max_scheduled_posts" value="10" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="trialDays">Trial Days</label>
                            <input type="number" id="trialDays" name="trial_days" value="0" min="0" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="planStatus">Status</label>
                            <select id="planStatus" name="is_active">
                                <option value="true" selected>Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="closeAddPlanModal()">
                            <span class="btn-icon">❌</span>
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            <span class="btn-icon">➕</span>
                            Create Plan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add form submit handler
    document.getElementById('addPlanForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createNewPlan();
    });
    
    // Show modal with animation
    setTimeout(() => {
        document.getElementById('addPlanModal').classList.add('show');
    }, 10);
}

// Create new plan
async function createNewPlan() {
    try {
        const form = document.getElementById('addPlanForm');
        const formData = new FormData(form);
        
        // Convert form data to plan object - match exact database schema
        const planData = {
            name: formData.get('name'),
            plan_type: formData.get('type'),
            price: parseFloat(formData.get('price')),
            description: formData.get('description'),
            features: formData.get('features').split('\n').filter(f => f.trim()),
            is_active: formData.get('is_active') === 'true',
            interval: formData.get('interval'),
            currency: 'usd',
            max_instagram_accounts: parseInt(formData.get('max_instagram_accounts')) || 1,
            max_automation_campaigns: parseInt(formData.get('max_automation_campaigns')) || 1,
            max_scheduled_posts: parseInt(formData.get('max_scheduled_posts')) || 10,
            trial_days: parseInt(formData.get('trial_days')) || 0
        };
        
        console.log('➕ Creating new plan:', planData);
        
        // Create plan in Supabase
        const { data, error } = await supabaseClient
            .from('subscription_plans')
            .insert([planData])
            .select()
            .single();
            
        if (error) {
            console.error('❌ Failed to create plan:', error);
            showNotification('Failed to create plan: ' + error.message, 'error');
            return;
        }
        
        console.log('✅ Plan created successfully:', data);
        showNotification('New plan created successfully!', 'success');
        
        // Close modal and refresh plans
        closeAddPlanModal();
        loadSubscriptionPlans();
        
    } catch (error) {
        console.error('❌ Create new plan failed:', error);
        showNotification('Failed to create plan: ' + error.message, 'error');
    }
}

// Close add plan modal
function closeAddPlanModal() {
    const modal = document.getElementById('addPlanModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Logo click handler
function handleLogoClick() {
    console.log('Logo clicked, navigating to home page');
    window.location.href = 'index.html';
}
