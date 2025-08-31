// Auth Page JavaScript with Supabase Integration
// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase client
    initializeSupabase();
    
    // Initialize the page
    initializeAuth();
    
    // Add form submission handlers
    setupFormHandlers();
    
    // Add input focus effects
    setupInputEffects();
    
    // Check authentication state (now just clears localStorage, no redirects)
    checkAuthState();
});

// Initialize Supabase client
function initializeSupabase() {
    if (typeof window.supabase !== 'undefined') {
        window.supabaseClient = window.supabase.createClient(
            'https://uwloajvooajxhffphjns.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bG9hanZvb2FqeGhmZnBoam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjUwNDYsImV4cCI6MjA3MDYwMTA0Nn0.fchJV646Yc1FgiWokclFlUMDJEtRW8X_j_I3TgskQxU'
        );
        console.log('Supabase client initialized');
    } else {
        console.error('Supabase library not loaded');
    }
}

function initializeAuth() {
    console.log('initializeAuth called');
    
    // Check URL parameters to determine which form to show
    const urlParams = new URLSearchParams(window.location.search);
    const formType = urlParams.get('form');
    
    console.log('URL form parameter:', formType);
    
    // Set active form based on URL parameter
    if (formType === 'signup') {
        switchToSignUp();
    } else {
        switchToSignIn();
    }
    
    // Add smooth entrance animation
    setTimeout(() => {
        const authCard = document.querySelector('.auth-card');
        if (authCard) {
            authCard.style.opacity = '1';
            authCard.style.transform = 'translateY(0)';
            console.log('Auth card animation applied');
        } else {
            console.error('Auth card not found');
        }
    }, 100);
}

function switchToSignIn() {
    console.log('switchToSignIn called');
    
    // Update button states
    const signinBtn = document.querySelector('.signin-btn');
    const signupBtn = document.querySelector('.signup-btn');
    
    if (signinBtn && signupBtn) {
        signinBtn.classList.add('active');
        signupBtn.classList.remove('active');
        console.log('Button states updated');
    } else {
        console.error('Buttons not found:', { signinBtn, signupBtn });
    }
    
    // Show sign in form
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    
    if (signinForm && signupForm) {
        signinForm.classList.add('active');
        signupForm.classList.remove('active');
        console.log('Forms switched to sign in');
    } else {
        console.error('Forms not found:', { signinForm, signupForm });
    }
    
    // Update page title
    document.title = 'Sign In - Instaflow';
}

function switchToSignUp() {
    console.log('switchToSignUp called');
    
    // Update button states
    const signupBtn = document.querySelector('.signup-btn');
    const signinBtn = document.querySelector('.signin-btn');
    
    if (signupBtn && signinBtn) {
        signupBtn.classList.add('active');
        signinBtn.classList.remove('active');
        console.log('Button states updated');
    } else {
        console.error('Buttons not found:', { signupBtn, signinBtn });
    }
    
    // Show sign up form
    const signupForm = document.getElementById('signup-form');
    const signinForm = document.getElementById('signin-form');
    
    if (signupForm && signinForm) {
        signupForm.classList.add('active');
        signinForm.classList.remove('active');
        console.log('Forms switched to sign up');
    } else {
        console.error('Forms not found:', { signupForm, signinForm });
    }
    
    // Update page title
    document.title = 'Sign Up - Instaflow';
}

function setupFormHandlers() {
    // Sign In Form Handler
    document.getElementById('signin-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleSignIn();
    });
    
    // Sign Up Form Handler
    document.getElementById('signup-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleSignUp();
    });
    
    // Social Auth Handlers
    document.querySelectorAll('.social-btn.google').forEach(btn => {
        btn.addEventListener('click', () => handleSocialAuth('google'));
    });
    
    document.querySelectorAll('.social-btn.github').forEach(btn => {
        btn.addEventListener('click', () => handleSocialAuth('github'));
    });
}

function setupInputEffects() {
    // Add focus effects to all inputs
    document.querySelectorAll('.input-wrapper input').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
        
        // Add typing animation
        input.addEventListener('input', function() {
            if (this.value.length > 0) {
                this.classList.add('has-content');
            } else {
                this.classList.remove('has-content');
            }
        });
    });
}

async function handleSignIn() {
    const email = document.querySelector('#signin-form input[type="email"]').value;
    const password = document.querySelector('#signin-form input[type="password"]').value;
    const rememberMe = document.querySelector('#signin-form input[type="checkbox"]').checked;
    
    // Basic validation
    if (!email || !password) {
        showNotification('Please fill in all fields!', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#signin-form .submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="btn-text">Signing In...</span>';
    submitBtn.disabled = true;
    
    try {
        if (!window.supabaseClient) {
            throw new Error('Supabase client not initialized');
        }
        
        // Sign in with Supabase
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        // Show success message
        showNotification('Sign in successful! Redirecting to home page...', 'success');
        
        // Store authentication state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Sign in error:', error);
        showNotification(error.message || 'Sign in failed!', 'error');
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleSignUp() {
    const fullName = document.querySelector('#signup-form input[type="text"]').value;
    const email = document.querySelector('#signup-form input[type="email"]').value;
    const password = document.querySelector('#signup-form input[type="password"]').value;
    const confirmPassword = document.querySelector('#signup-form input[type="password"]:last-of-type').value;
    const agreeToTerms = document.querySelector('#signup-form input[type="checkbox"]').checked;
    
    // Basic validation
    if (!fullName || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields!', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters!', 'error');
        return;
    }
    
    if (!agreeToTerms) {
        showNotification('Please agree to the terms and conditions!', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#signup-form .submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="btn-text">Creating Account...</span>';
    submitBtn.disabled = true;
    
    try {
        if (!window.supabaseClient) {
            throw new Error('Supabase client not initialized');
        }
        
        console.log('🚀 Starting signup process for:', email);
        
        // Sign up with Supabase
        const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });
        
        if (error) throw error;
        
        console.log('✅ User created in Supabase Auth:', data);
        
        // Check if user was created successfully
        if (data.user && data.user.id) {
            console.log('👤 User ID:', data.user.id);
            
            // Create profile in profiles table
            console.log('📝 Creating profile in profiles table...');
            const { data: profile, error: profileError } = await window.supabaseClient
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        email: email,
                        full_name: fullName,
                        plan_type: 'free',
                        plan_status: 'active',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();
            
            if (profileError) {
                console.error('❌ Failed to create profile:', profileError);
                showNotification('Account created but profile creation failed. Please contact support.', 'warning');
            } else {
                console.log('✅ Profile created successfully:', profile);
                showNotification('Account and profile created successfully! Redirecting to home page...', 'success');
            }
        } else {
            console.log('⚠️ User created but no user ID returned');
            showNotification('Account created successfully! Redirecting to home page...', 'success');
        }
        
        // Store user info in localStorage for immediate access
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userFullName', fullName);
        
        // Redirect to home page after successful signup
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Sign up error:', error);
        showNotification(error.message || 'Account creation failed!', 'error');
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function handleSocialAuth(provider) {
    // Show loading state
    const socialBtn = document.querySelector(`.social-btn.${provider}`);
    const originalText = socialBtn.innerHTML;
    socialBtn.innerHTML = `<span class="social-icon">⏳</span> Connecting...`;
    socialBtn.disabled = true;
    
    // Simulate social auth
    setTimeout(() => {
        // Reset button
        socialBtn.innerHTML = originalText;
        socialBtn.disabled = false;
        
        // Show success message
        showNotification(`${provider.charAt(0).toUpperCase() + provider.slice(1)} authentication successful!`, 'success');
        
        // Redirect to dashboard or home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }, 2000);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(20, 255, 114, 0.9)' : type === 'error' ? 'rgba(255, 87, 87, 0.9)' : 'rgba(0, 212, 255, 0.9)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    // Tab key navigation
    if (e.key === 'Tab') {
        // Handle custom tab navigation if needed
    }
    
    // Enter key on inputs
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        const form = e.target.closest('form');
        if (form) {
            const submitBtn = form.querySelector('.submit-btn');
            if (submitBtn) {
                submitBtn.click();
            }
        }
    }
});

// Add form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });
    
    return isValid;
}

// Add input error styling
document.querySelectorAll('input[required]').forEach(input => {
    input.addEventListener('blur', function() {
        if (!this.value.trim()) {
            this.classList.add('error');
        } else {
            this.classList.remove('error');
        }
    });
});

// Authentication State Management
function switchToLoggedInState(email) {
    // Store authentication state
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    console.log('Stored login state in localStorage for:', email);
}

function switchToGuestState() {
    // Clear authentication state
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFullName');
    console.log('Cleared login state from localStorage');
}

async function checkAuthState() {
    try {
        // DISABLED: No automatic redirects on auth page
        // Users should stay on auth page to sign in/up manually
        console.log('Auth page: No automatic redirects - user must sign in/up manually');
        
        // Clear any localStorage to ensure clean state
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userFullName');
        
        // Don't check Supabase session or redirect
        // Just stay on the auth page
        
    } catch (error) {
        console.error('Auth state check error:', error);
        // Stay on auth page regardless of errors
    }
}

// Function to create profiles for existing users (can be called from admin dashboard)
async function createProfilesForExistingUsers() {
    try {
        console.log('🔧 Creating profiles for existing users...');
        
        if (!window.supabaseClient) {
            throw new Error('Supabase client not initialized');
        }
        
        // Get current user to check if they're authenticated
        const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();
        
        if (userError || !user) {
            console.error('❌ User not authenticated');
            showNotification('Please sign in first to create profiles', 'error');
            return;
        }
        
        console.log('👤 Current user:', user.email);
        
        // Check if current user has a profile
        const { data: existingProfile, error: profileError } = await window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (profileError) {
            console.log('⚠️ Current user profile not found, creating one...');
            
            // Create profile for current user
            const { data: newProfile, error: createError } = await window.supabaseClient
                .from('profiles')
                .insert([
                    {
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                        plan_type: 'free',
                        plan_status: 'active',
                        created_at: user.created_at || new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();
            
            if (createError) {
                console.error('❌ Failed to create profile for current user:', createError);
                showNotification('Failed to create profile: ' + createError.message, 'error');
            } else {
                console.log('✅ Profile created for current user:', newProfile);
                showNotification('Profile created for current user!', 'success');
            }
        } else {
            console.log('✅ Current user profile exists:', existingProfile);
            showNotification('Current user profile already exists', 'info');
        }
        
    } catch (error) {
        console.error('❌ Create profiles for existing users failed:', error);
        showNotification('Failed to create profiles: ' + error.message, 'error');
    }
}

// Logo click handler
function handleLogoClick() {
    console.log('Logo clicked, navigating to home page');
    window.location.href = 'index.html';
}

// Add CSS for error states
const errorStyles = document.createElement('style');
errorStyles.textContent = `
    .input-wrapper input.error {
        border-color: #ff5757 !important;
        box-shadow: 0 0 20px rgba(255, 87, 87, 0.3) !important;
    }
    
    .input-wrapper input.error + .input-line {
        background: #ff5757 !important;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-icon {
        font-size: 1.2rem;
    }
    
    .notification-message {
        font-weight: 500;
    }
`;
document.head.appendChild(errorStyles);

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
