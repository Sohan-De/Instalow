// Initialize Supabase client
function initializeSupabase() {
    if (typeof window.supabase !== 'undefined') {
        window.supabaseClient = window.supabase.createClient(
            'https://uwloajvooajxhffphjns.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bG9hanZvb2FqeGhmZnBoam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjUwNDYsImV4cCI6MjA3MDYwMTA0Nn0.fchJV646Yc1FgiWokclFlUMDJEtRW8X_j_I3TgskQxU'
        );
        console.log('Supabase client initialized in partners page');
    } else {
        console.error('Supabase library not loaded');
    }
}

class PartnersManager {
    constructor() {
        this.supabase = null;
        this.partnersContainer = null;
        this.init();
    }

    async init() {
        try {
            console.log('PartnersManager init started...');
            console.log('window.supabaseClient:', window.supabaseClient);
            console.log('window.supabase:', window.supabase);
            
            // Wait for Supabase to be ready
            if (window.supabaseClient) {
                console.log('Using window.supabaseClient');
                this.supabase = window.supabaseClient;
                await this.loadPartners();
            } else if (window.supabase) {
                console.log('Using window.supabase');
                this.supabase = window.supabase;
                await this.loadPartners();
            } else {
                console.log('Waiting for Supabase ready event...');
                // Listen for Supabase ready event
                document.addEventListener('supabase-ready', async () => {
                    console.log('Supabase ready event received!');
                    this.supabase = window.supabaseClient || window.supabase;
                    await this.loadPartners();
                });
                
                // Also try after a delay
                setTimeout(async () => {
                    if (!this.supabase && (window.supabaseClient || window.supabase)) {
                        console.log('Timeout fallback: Supabase now available');
                        this.supabase = window.supabaseClient || window.supabase;
                        await this.loadPartners();
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('Error initializing PartnersManager:', error);
            this.showFallbackPartners();
        }
    }

    async loadPartners() {
        try {
            console.log('Loading partners from Supabase...');
            console.log('Supabase client:', this.supabase);
            
            if (!this.supabase) {
                console.error('No Supabase client available');
                this.showFallbackPartners();
                return;
            }
            
            const { data: partners, error } = await this.supabase
                .from('partners')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching partners:', error);
                this.showFallbackPartners();
                return;
            }

            console.log('Partners loaded:', partners);
            console.log('Number of partners:', partners ? partners.length : 0);
            
            if (partners && partners.length > 0) {
                this.renderPartners(partners);
            } else {
                this.showNoPartners();
            }
        } catch (error) {
            console.error('Error in loadPartners:', error);
            this.showFallbackPartners();
        }
    }

    renderPartners(partners) {
        const container = document.querySelector('.partner-details-cards');
        if (!container) {
            console.error('Partners container not found');
            return;
        }

        // Clear existing content
        container.innerHTML = '';

        // Render each partner
        partners.forEach(partner => {
            const partnerCard = this.createPartnerCard(partner);
            container.appendChild(partnerCard);
        });

        console.log(`Rendered ${partners.length} partner cards`);
    }

    createPartnerCard(partner) {
        const card = document.createElement('div');
        card.className = 'partner-card';
        
        card.innerHTML = `
            <div class="partner-logo">
                <img src="${partner.image_url || partner.logo_url || 'https://via.placeholder.com/60x60/00d4ff/ffffff?text=LOGO'}" 
                     alt="${partner.name} Logo" 
                     class="logo-img"
                     onerror="this.src='https://via.placeholder.com/60x60/00d4ff/ffffff?text=LOGO'">
            </div>
            <div class="partner-name">
                <h3>${partner.name}</h3>
            </div>
            <div class="partner-badge">
                ${partner.partner_type}
            </div>
            <div class="partner-description">
                <p>${partner.description || 'No description available'}</p>
            </div>
            <div class="partner-button">
                <a href="${partner.website_url || '#'}" 
                   class="partner-website" 
                   target="_blank"
                   ${!partner.website_url ? 'onclick="return false;" style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                    <span class="website-icon">🌐</span>
                    <span class="website-text">${partner.website_url ? 'Visit Website' : 'Website Unavailable'}</span>
                </a>
            </div>
        `;

        return card;
    }

    showNoPartners() {
        const container = document.querySelector('.partner-details-cards');
        if (!container) return;

        container.innerHTML = `
            <div class="no-partners-message">
                <h3>No Partners Available</h3>
                <p>Currently there are no partners to display. Check back later!</p>
            </div>
        `;
    }

    showFallbackPartners() {
        console.log('Showing fallback partners...');
        const container = document.querySelector('.partner-details-cards');
        if (!container) return;

        // Show fallback partners if Supabase is not available
        const fallbackPartners = [
            {
                name: 'TechFlow Solutions',
                description: 'Leading AI-powered automation engine provider with cutting-edge solutions for Instagram automation.',
                website_url: 'https://techflow-solutions.com',
                logo_url: 'https://via.placeholder.com/60x60/00d4ff/ffffff?text=TF',
                partner_type: 'Technology Partner'
            },
            {
                name: 'Growth Masters',
                description: 'Digital marketing specialists & social media experts helping brands grow their Instagram presence.',
                website_url: 'https://growthmasters.com',
                logo_url: 'https://via.placeholder.com/60x60/00ff88/ffffff?text=GM',
                partner_type: 'Agency Partner'
            }
        ];

        this.renderPartners(fallbackPartners);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing PartnersManager...');
    
    // Initialize Supabase first
    initializeSupabase();
    
    new PartnersManager();
    
    // Check authentication state for navigation
    checkAuthState();
});

// Also listen for Supabase ready event
document.addEventListener('supabase-ready', () => {
    console.log('Supabase ready event received, reinitializing PartnersManager...');
    new PartnersManager();
    
    // Check authentication state again
    checkAuthState();
});

// Authentication State Management Functions
async function checkAuthState() {
    try {
        if (!window.supabaseClient) {
            // Fallback to localStorage if Supabase is not available
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            const userEmail = localStorage.getItem('userEmail');
            
            if (isLoggedIn && userEmail) {
                switchToLoggedInState(userEmail);
            } else {
                switchToGuestState();
            }
            return;
        }
        
        // Check current session with Supabase
        const { data: { session }, error } = await window.supabaseClient.auth.getSession();
        
        if (error) throw error;
        
        if (session && session.user) {
            // User is authenticated
            switchToLoggedInState(session.user.email);
            
            // Set up auth state change listener
            window.supabaseClient.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    switchToLoggedInState(session?.user?.email);
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

function switchToLoggedInState(email) {
    // Hide guest state, show logged in state
    const guestState = document.querySelector('.guest-state');
    const loggedInState = document.querySelector('.logged-in-state');
    
    if (guestState && loggedInState) {
        guestState.style.display = 'none';
        loggedInState.style.display = 'flex';
        
        // Update profile name with email
        const profileName = document.querySelector('.profile-name');
        if (profileName) {
            profileName.textContent = email.split('@')[0]; // Show username part of email
        }
        
        // Store authentication state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
    }
}

function switchToGuestState() {
    // Show guest state, hide logged in state
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

async function handleLogout() {
    // Show loading state
    const profileBtn = document.querySelector('.profile-btn');
    if (!profileBtn) return;
    
    const originalText = profileBtn.innerHTML;
    profileBtn.innerHTML = '<span class="profile-avatar">⏳</span> <span class="profile-name">Signing Out...</span>';
    
    try {
        if (!window.supabaseClient) {
            throw new Error('Supabase client not initialized');
        }
        
        // Sign out from Supabase
        const { error } = await window.supabaseClient.auth.signOut();
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

// Test function for debugging
window.testSupabaseConnection = async function() {
    console.log('=== Testing Supabase Connection ===');
    console.log('window.supabaseClient:', window.supabaseClient);
    console.log('window.supabase:', window.supabase);
    
    if (window.supabaseClient) {
        try {
            const { data, error } = await window.supabaseClient
                .from('partners')
                .select('*');
            
            if (error) {
                console.error('Supabase query error:', error);
                alert('Supabase Error: ' + error.message);
            } else {
                console.log('Supabase query successful:', data);
                alert(`Supabase working! Found ${data.length} partners`);
            }
        } catch (err) {
            console.error('Supabase test failed:', err);
            alert('Supabase test failed: ' + err.message);
        }
    } else {
        alert('No Supabase client available!');
    }
};

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
