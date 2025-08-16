// Stripe Configuration
const stripe = Stripe('pk_test_51QH7ScFv00fKIACqGfORYO5j1VPJRwZgxxY2P1662qAIwfbm1vv3nfJi4Ig4UUrCoPDoMuslLPGRUja9NQZl6ecq003TypD8pF');
const elements = stripe.elements();

// DOM Elements
const paymentForm = document.getElementById('payment-form');
const submitButton = document.getElementById('submit-btn');
const cardElement = document.getElementById('card-element');
const cardErrors = document.getElementById('card-errors');
const successModal = document.getElementById('success-modal');
const loadingOverlay = document.getElementById('loading-overlay');
const paymentMethods = document.querySelectorAll('.payment-method');

// Plan configurations
const planConfigs = {
    free: {
        name: "Instaflow Free",
        badge: "Free",
        price: 0,
        period: "Lifetime",
        description: "Instaflow Free Plan",
        features: [
            "Basic Instagram Automation",
            "1 Instagram account",
            "Limited posts",
            "Email Support",
            "Basic Features"
        ],
        discount: 0,
        total: 0
    },
    trial: {
        name: "Instaflow Trial",
        badge: "Free Trial",
        price: 0,
        period: "7 days",
        description: "Instaflow Trial Plan",
        features: [
            "Basic Instagram Automation",
            "AI Caption Generation",
            "Simple Analytics",
            "Email Support",
            "Limited Features"
        ],
        discount: 0,
        total: 0
    },
    professional: {
        name: "Instaflow Professional",
        badge: "Most Popular",
        price: 29,
        period: "Monthly",
        description: "Instaflow Professional Plan",
        features: [
            "Advanced Instagram Automation",
            "5 Instagram accounts",
            "Unlimited posts",
            "Analytics Dashboard",
            "Priority Support",
            "AI Content Generation"
        ],
        discount: 5,
        total: 24
    },
    enterprise: {
        name: "Instaflow Enterprise",
        badge: "Enterprise",
        price: 99,
        period: "Monthly",
        description: "Instaflow Enterprise Plan",
        features: [
            "All Professional Features",
            "Unlimited Instagram accounts",
            "Team Management",
            "Custom Integrations",
            "Dedicated Support",
            "SLA Guarantee"
        ],
        discount: 20,
        total: 79
    }
};

// Log current plan details for debugging
function logCurrentPlan() {
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan') || 'professional';
    const price = parseInt(urlParams.get('price')) || 29;
    const period = urlParams.get('period') || 'month';
    
    console.log('=== Current Checkout Plan Details ===');
    console.log('URL Parameters:', { plan, price, period });
    console.log('Selected Plan Object:', window.selectedPlan);
    console.log('Available Plan Configs:', Object.keys(planConfigs));
    console.log('=====================================');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
    setupEventListeners();
    checkAuthState();
    loadPlanDetails();
    
    // Log plan details for debugging
    setTimeout(() => {
        logCurrentPlan();
    }, 1000);
});

// Test function to manually test different plans
window.testPlanLoading = function(planType) {
    console.log('Testing plan loading for:', planType);
    
    // Simulate URL parameters for testing
    const testParams = {
        free: { plan: 'free', price: 0, period: 'lifetime' },
        professional: { plan: 'professional', price: 29, period: 'month' },
        enterprise: { plan: 'enterprise', price: 99, period: 'month' }
    };
    
    const testPlan = testParams[planType];
    if (testPlan) {
        // Update URL without reloading
        const newUrl = `checkout.html?plan=${testPlan.plan}&price=${testPlan.price}&period=${testPlan.period}`;
        window.history.pushState({}, '', newUrl);
        
        // Reload plan details
        loadPlanDetails();
        
        console.log('Plan test completed for:', planType);
    }
};

// Load plan details based on URL parameters and database
async function loadPlanDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const planType = urlParams.get('plan') || 'professional';
    
    console.log('Loading plan details for:', planType);
    
    try {
        // Try to get plan from Supabase first
        if (window.supabaseClient) {
            const { data: plans, error } = await window.supabaseClient
                .from('subscription_plans')
                .select('*')
                .eq('plan_type', planType)
                .eq('is_active', true)
                .single();
            
            if (!error && plans) {
                console.log('Found plan in database:', plans);
                
                // Convert price from cents to dollars
                const priceInDollars = plans.price / 100;
                
                const planConfig = {
                    name: plans.name || `Instaflow ${planType.charAt(0).toUpperCase() + planType.slice(1)}`,
                    badge: plans.plan_type === 'professional' ? 'Most Popular' : 
                           plans.plan_type === 'enterprise' ? 'Enterprise' : 'Free',
                    price: priceInDollars,
                    period: plans.interval === 'month' ? 'Monthly' : 
                           plans.interval === 'year' ? 'Yearly' : 
                           plans.interval === 'lifetime' ? 'Lifetime' : 'Monthly',
                    description: plans.description || `Instaflow ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`,
                    features: plans.features || planConfigs.professional.features,
                    discount: plans.plan_type === 'professional' ? 5 : 
                             plans.plan_type === 'enterprise' ? 20 : 0,
                    total: plans.plan_type === 'professional' ? priceInDollars - 5 : 
                           plans.plan_type === 'enterprise' ? priceInDollars - 20 : priceInDollars
                };
                
                console.log('Using database plan config:', planConfig);
                updateCheckoutUI(planConfig);
                return;
            } else {
                console.log('Plan not found in database, using fallback configs');
            }
        }
    } catch (error) {
        console.log('Error fetching from database, using fallback configs:', error);
    }
    
    // Fallback to hardcoded configs if database fails
    const plan = planType;
    const price = parseInt(urlParams.get('price')) || 29;
    const period = urlParams.get('period') || 'month';
    
    console.log('Using fallback plan details:', { plan, price, period });
    
    // Find the matching plan configuration
    let planConfig = planConfigs[plan];
    
    // If plan not found in configs, create a dynamic one based on URL parameters
    if (!planConfig) {
        planConfig = {
            name: `Instaflow ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
            badge: plan.charAt(0).toUpperCase() + plan.slice(1),
            price: price,
            period: period,
            description: `Instaflow ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
            features: planConfigs.professional.features, // Use professional features as default
            discount: 0,
            total: price
        };
        
        // Add discount for professional and enterprise plans
        if (plan === 'professional') {
            planConfig.discount = 5;
            planConfig.total = price - 5;
        } else if (plan === 'enterprise') {
            planConfig.discount = 20;
            planConfig.total = price - 20;
        }
    }
    
        console.log('Using fallback plan config:', planConfig);
    updateCheckoutUI(planConfig);
}

// Function to update the checkout UI with plan data
function updateCheckoutUI(planConfig) {
    console.log('Updating checkout UI with plan config:', planConfig);
    
    // Update plan name and badge
    const planNameElement = document.getElementById('plan-name');
    const planBadgeElement = document.getElementById('plan-badge');

    if (planNameElement) {
        planNameElement.textContent = planConfig.name;
        console.log('Updated plan name to:', planConfig.name);
    } else {
        console.warn('Plan name element not found');
    }

    if (planBadgeElement) {
        planBadgeElement.textContent = planConfig.badge;
        console.log('Updated plan badge to:', planConfig.badge);
    } else {
        console.warn('Plan badge element not found');
    }

    // Update plan description
    const planDescriptionElement = document.getElementById('plan-description');
    if (planDescriptionElement) {
        planDescriptionElement.textContent = planConfig.description;
        console.log('Updated plan description to:', planConfig.description);
    } else {
        console.warn('Plan description element not found');
    }

    // Update pricing
    const planPriceElement = document.getElementById('plan-price');
    if (planPriceElement) {
        planPriceElement.textContent = `$${planConfig.price}`;
        console.log('Updated plan price to:', planConfig.price);
    } else {
        console.warn('Plan price element not found');
    }

    // Update discount (hide if no discount)
    const discountItem = document.getElementById('discount-item');
    if (discountItem) {
        if (planConfig.discount > 0) {
            discountItem.style.display = 'flex';
            const discountPriceElement = discountItem.querySelector('.price');
            if (discountPriceElement) {
                discountPriceElement.textContent = `-$${planConfig.discount}`;
                console.log('Updated discount to:', planConfig.discount);
            }
        } else {
            discountItem.style.display = 'none';
            console.log('Hiding discount item');
        }
    } else {
        console.warn('Discount item element not found');
    }

    // Update total price
    const totalPriceElement = document.getElementById('total-price');
    const btnAmountElement = document.getElementById('btn-amount');

    if (totalPriceElement) {
        totalPriceElement.textContent = `$${planConfig.total}`;
        console.log('Updated total price to:', planConfig.total);
    } else {
        console.warn('Total price element not found');
    }

    if (btnAmountElement) {
        btnAmountElement.textContent = `$${planConfig.total}`;
        console.log('Updated button amount to:', planConfig.total);
    } else {
        console.warn('Button amount element not found');
    }

    // Update features
    const featuresContainer = document.getElementById('plan-features');
    if (featuresContainer) {
        featuresContainer.innerHTML = '';
        
        planConfig.features.forEach(feature => {
            const featureItem = document.createElement('div');
            featureItem.className = 'feature-item';
            featureItem.innerHTML = `
                <span class="feature-icon">✅</span>
                <span>${feature}</span>
            `;
            featuresContainer.appendChild(featureItem);
        });
        
        console.log('Updated features:', planConfig.features.length, 'features');
    } else {
        console.warn('Features container not found');
    }

    // Update page title
    document.title = `Checkout - ${planConfig.name} - Instaflow`;

    // Store plan info for payment processing
    window.selectedPlan = planConfig;

    console.log('Plan details loaded successfully:', planConfig);
}

// Initialize checkout functionality
function initializeCheckout() {
    // Create Stripe card element
    const card = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#ffffff',
                fontFamily: 'Poppins, sans-serif',
                '::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                },
                iconColor: '#00ff88',
            },
            invalid: {
                color: '#ff5757',
                iconColor: '#ff5757',
            },
        },
    });

    // Mount the card element
    card.mount('#card-element');

    // Handle real-time validation errors
    card.addEventListener('change', function(event) {
        if (event.error) {
            showCardError(event.error.message);
        } else {
            hideCardError();
        }
    });

    // Store card element for later use
    window.stripeCard = card;
}

// Setup event listeners
function setupEventListeners() {
    // Payment method selection
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Remove active class from all methods
            paymentMethods.forEach(m => m.classList.remove('active'));
            // Add active class to clicked method
            this.classList.add('active');
            
            // Handle method-specific logic
            const methodType = this.dataset.method;
            handlePaymentMethodChange(methodType);
        });
    });

    // Form submission
    paymentForm.addEventListener('submit', handleFormSubmission);

    // Input focus effects
    const inputs = document.querySelectorAll('.form-group input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });

    // Terms checkbox validation
    const termsCheckbox = document.getElementById('terms');
    termsCheckbox.addEventListener('change', function() {
        submitButton.disabled = !this.checked;
    });
}

// Handle payment method change
function handlePaymentMethodChange(methodType) {
    if (methodType === 'card') {
        cardElement.style.display = 'block';
        document.getElementById('crypto-payment-interface').style.display = 'none';
        // Show card-related fields
    } else if (methodType === 'crypto') {
        cardElement.style.display = 'none';
        document.getElementById('crypto-payment-interface').style.display = 'block';
        // Initialize crypto payment system
        initializeCryptoPayment();
    }
}

// Handle form submission
async function handleFormSubmission(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }

    // Show loading state
    setLoadingState(true);
    
    try {
        // Get form data
        const formData = getFormData();
        
        console.log('Processing payment for:', formData.email, 'Plan:', window.selectedPlan?.name);
        
        // Process payment using demo function (simulates real payment flow)
        const paymentResult = await processPayment(formData);
        
        if (paymentResult.success) {
            // Payment succeeded
            console.log('Payment successful:', paymentResult.paymentIntent);
            
            // Update user profile with purchased plan
            await updateUserProfileWithPlan(window.selectedPlan);
            
            // Show success notification
            showNotification(`Payment successful! Welcome to ${window.selectedPlan?.name}!`, 'success');
            
            // Show success modal
            showSuccessModal();
            setLoadingState(false);
            
            // Store purchase info in localStorage
            storePurchaseInfo(formData);
            
            // Redirect to dashboard after delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        } else {
            // Payment failed
            showNotification('Payment failed. Please try again.', 'error');
            setLoadingState(false);
        }
    } catch (error) {
        console.error('Payment error:', error);
        showNotification('An error occurred during payment. Please try again.', 'error');
        setLoadingState(false);
    }
}

// Validate form
function validateForm() {
    const requiredFields = ['email', 'name', 'address', 'city', 'state', 'zip'];
    const termsChecked = document.getElementById('terms').checked;
    
    // Check required fields
    for (const field of requiredFields) {
        const input = document.getElementById(field);
        if (!input.value.trim()) {
            showFieldError(input, 'This field is required');
            return false;
        } else {
            clearFieldError(input);
        }
    }
    
    // Validate email format
    const email = document.getElementById('email').value;
    if (!isValidEmail(email)) {
        showFieldError(document.getElementById('email'), 'Please enter a valid email address');
        return false;
    }
    
    // Check terms agreement
    if (!termsChecked) {
        showNotification('Please agree to the Terms of Service', 'error');
        return false;
    }
    
    return true;
}

// Get form data
function getFormData() {
    return {
        email: document.getElementById('email').value,
        name: document.getElementById('name').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value,
        marketing: document.getElementById('marketing').checked,
    };
}

// Create payment intent (demo function - simulates payment process)
async function createPaymentIntent(formData) {
    const selectedPlan = window.selectedPlan || planConfigs.professional;
    const amountInCents = Math.round(selectedPlan.total * 100);
    
    console.log('Creating payment intent for plan:', selectedPlan.name, 'Amount:', amountInCents);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock payment intent that won't cause Stripe errors
    return {
        id: 'pi_demo_' + Date.now(),
        client_secret: 'pi_demo_secret_' + Math.random().toString(36).substr(2, 9),
        amount: amountInCents,
        currency: 'usd',
        status: 'requires_payment_method'
    };
}

// Update user profile with purchased plan
async function updateUserProfileWithPlan(planData) {
    try {
        if (!window.supabaseClient) {
            console.log('Supabase client not available, skipping profile update');
            return;
        }

        // Get current user session
        const { data: { session }, error: sessionError } = await window.supabaseClient.auth.getSession();
        if (sessionError || !session) {
            console.log('No active session, skipping profile update');
            return;
        }

        const userId = session.user.id;
        console.log('Updating profile for user:', userId, 'with plan:', planData.name);

        // Map plan names to better display names
        let planType = 'free';
        if (planData.name.includes('Professional')) {
            planType = 'professional';
        } else if (planData.name.includes('Enterprise')) {
            planType = 'enterprise';
        } else if (planData.name.includes('Trial')) {
            planType = 'trial';
        }

        // Update the user's profile in Supabase
        const { data: updatedProfile, error: updateError } = await window.supabaseClient
            .from('profiles')
            .upsert({
                id: userId,
                email: session.user.email,
                plan_type: planType,
                plan_status: 'active',
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'id'
            })
            .select()
            .single();

        if (updateError) {
            console.error('Error updating profile:', updateError);
        } else {
            console.log('Profile updated successfully with plan:', updatedProfile);
        }

    } catch (error) {
        console.error('Error updating user profile with plan:', error);
    }
}

// Process payment (demo function)
async function processPayment(formData) {
    const selectedPlan = window.selectedPlan || planConfigs.professional;
    
    console.log('Processing payment for plan:', selectedPlan.name);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate successful payment
    return {
        success: true,
        paymentIntent: {
            id: 'pi_demo_' + Date.now(),
            status: 'succeeded',
            amount: Math.round(selectedPlan.total * 100)
        }
    };
}

// Show card error
function showCardError(message) {
    cardErrors.textContent = message;
    cardErrors.classList.add('show');
    cardElement.style.borderColor = '#ff5757';
}

// Hide card error
function hideCardError() {
    cardErrors.classList.remove('show');
    cardElement.style.borderColor = 'rgba(20, 255, 114, 0.2)';
}

// Show field error
function showFieldError(input, message) {
    const errorDiv = input.parentElement.querySelector('.field-error') || 
                    createFieldErrorElement(input.parentElement);
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    input.style.borderColor = '#ff5757';
}

// Clear field error
function clearFieldError(input) {
    const errorDiv = input.parentElement.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
    input.style.borderColor = 'rgba(20, 255, 114, 0.2)';
}

// Create field error element
function createFieldErrorElement(parent) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.cssText = `
        color: #ff5757;
        font-size: 0.8rem;
        margin-top: 0.3rem;
        display: none;
    `;
    parent.appendChild(errorDiv);
    return errorDiv;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Set loading state
function setLoadingState(loading) {
    if (loading) {
        loadingOverlay.classList.add('show');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loading-spinner"></span> Processing...';
    } else {
        loadingOverlay.classList.remove('show');
        submitButton.disabled = false;
        submitButton.innerHTML = `
            <span class="btn-text">Complete Purchase</span>
            <span class="btn-amount">$24.99</span>
            <span class="btn-arrow">→</span>
        `;
    }
}

// Show success modal
function showSuccessModal() {
    const selectedPlan = window.selectedPlan || planConfigs.professional;
    const modalMessage = document.getElementById('modal-message');
    
    if (modalMessage) {
        modalMessage.textContent = `Welcome to ${selectedPlan.name}! Your account has been activated.`;
    }
    
    successModal.classList.add('show');
}

// Close modal
function closeModal() {
    successModal.classList.remove('show');
}

// Store purchase info in localStorage
function storePurchaseInfo(formData) {
    const selectedPlan = window.selectedPlan || planConfigs.professional;
    
    const purchaseInfo = {
        email: formData.email,
        name: formData.name,
        marketing: formData.marketing,
        planName: selectedPlan.name,
        planType: selectedPlan.name.toLowerCase().includes('professional') ? 'professional' : 
                  selectedPlan.name.toLowerCase().includes('enterprise') ? 'enterprise' : 'free',
        amount: selectedPlan.total,
        timestamp: Date.now()
    };
    
    localStorage.setItem('instaflow_purchase', JSON.stringify(purchaseInfo));
    localStorage.setItem('instaflow_user_email', formData.email);
    
    console.log('Purchase info stored:', purchaseInfo);
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
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ff5757' : type === 'success' ? '#00ff88' : '#e6c14a'};
        color: #071b0f;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        font-family: 'Poppins', sans-serif;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: #071b0f;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    `;
    
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

// Check authentication state
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

// Toggle profile menu
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
document.addEventListener('click', function(event) {
    const profileMenu = document.querySelector('.profile-menu');
    const dropdown = document.getElementById('profile-dropdown');
    
    if (profileMenu && dropdown && !profileMenu.contains(event.target)) {
        dropdown.classList.remove('show');
        const profileBtn = document.querySelector('.profile-btn');
        if (profileBtn) {
            profileBtn.classList.remove('active');
        }
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .field-error {
        color: #ff5757;
        font-size: 0.8rem;
        margin-top: 0.3rem;
        display: none;
    }
    
    .form-group.focused label {
        color: var(--lab-neon);
    }
    
    .form-group.focused input {
        border-color: var(--lab-neon);
        box-shadow: 0 0 20px rgba(20, 255, 114, 0.2);
    }
`;
document.head.appendChild(style);

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

// ==================== CRYPTO PAYMENT SYSTEM ====================

// Crypto payment state
let cryptoPaymentState = {
    selectedCrypto: 'bitcoin',
    selectedWallet: null,
    cryptoRates: {},
    paymentAddress: null,
    paymentTimer: null,
    paymentStatus: 'idle'
};

// Initialize crypto payment system
function initializeCryptoPayment() {
    console.log('Initializing crypto payment system...');
    
    // Load crypto rates
    loadCryptoRates();
    
    // Setup crypto option selection
    setupCryptoOptions();
    
    // Setup wallet selection
    setupWalletSelection();
    
    // Update payment details
    updateCryptoPaymentDetails();
    
    // Show crypto interface
    document.getElementById('crypto-payment-interface').style.display = 'block';
}

// Load cryptocurrency exchange rates
async function loadCryptoRates() {
    try {
        // Simulate API call to get crypto rates
        const rates = {
            bitcoin: 45000,      // $45,000 per BTC
            ethereum: 2800,      // $2,800 per ETH
            usdt: 1.00,          // $1.00 per USDT
            usdc: 1.00           // $1.00 per USDC
        };
        
        cryptoPaymentState.cryptoRates = rates;
        
        // Update rate displays
        document.getElementById('btc-rate').textContent = `$${rates.bitcoin.toLocaleString()}`;
        document.getElementById('eth-rate').textContent = `$${rates.ethereum.toLocaleString()}`;
        document.getElementById('usdt-rate').textContent = `$${rates.usdt.toFixed(2)}`;
        document.getElementById('usdc-rate').textContent = `$${rates.usdc.toFixed(2)}`;
        
        console.log('Crypto rates loaded:', rates);
        
    } catch (error) {
        console.error('Error loading crypto rates:', error);
        showNotification('Failed to load cryptocurrency rates', 'error');
    }
}

// Setup crypto option selection
function setupCryptoOptions() {
    const cryptoOptions = document.querySelectorAll('.crypto-option');
    
    cryptoOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            cryptoOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to selected option
            this.classList.add('active');
            
            // Update selected crypto
            cryptoPaymentState.selectedCrypto = this.dataset.crypto;
            
            // Update payment details
            updateCryptoPaymentDetails();
            
            console.log('Selected crypto:', cryptoPaymentState.selectedCrypto);
        });
    });
}

// Setup wallet selection
function setupWalletSelection() {
    const walletButtons = document.querySelectorAll('.wallet-btn');
    const manualAddressInput = document.getElementById('manual-address-input');
    
    walletButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all wallet buttons
            walletButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to selected wallet
            this.classList.add('active');
            
            // Update selected wallet
            cryptoPaymentState.selectedWallet = this.dataset.wallet;
            
            // Show/hide manual address input
            if (cryptoPaymentState.selectedWallet === 'manual') {
                manualAddressInput.style.display = 'block';
            } else {
                manualAddressInput.style.display = 'none';
            }
            
            console.log('Selected wallet:', cryptoPaymentState.selectedWallet);
        });
    });
}

// Update crypto payment details
function updateCryptoPaymentDetails() {
    const selectedPlan = window.selectedPlan || planConfigs.professional;
    const usdAmount = selectedPlan.total;
    const selectedCrypto = cryptoPaymentState.selectedCrypto;
    const cryptoRate = cryptoPaymentState.cryptoRates[selectedCrypto] || 1;
    
    // Calculate crypto amounts
    const cryptoAmount = usdAmount / cryptoRate;
    const networkFee = getNetworkFee(selectedCrypto);
    const totalCrypto = cryptoAmount + (networkFee / cryptoRate);
    
    // Update display
    document.getElementById('crypto-usd-amount').textContent = `$${usdAmount.toFixed(2)}`;
    document.getElementById('crypto-amount').textContent = `${cryptoAmount.toFixed(8)} ${getCryptoSymbol(selectedCrypto)}`;
    document.getElementById('network-fee').textContent = `~$${networkFee.toFixed(2)}`;
    document.getElementById('total-crypto').textContent = `${totalCrypto.toFixed(8)} ${getCryptoSymbol(selectedCrypto)}`;
    
    console.log('Updated crypto payment details:', {
        usdAmount,
        cryptoAmount,
        networkFee,
        totalCrypto,
        selectedCrypto
    });
}

// Get network fee for different cryptocurrencies
function getNetworkFee(crypto) {
    const fees = {
        bitcoin: 2.50,      // Bitcoin network fee
        ethereum: 15.00,    // Ethereum gas fee
        usdt: 1.00,         // USDT network fee
        usdc: 1.00          // USDC network fee
    };
    
    return fees[crypto] || 2.00;
}

// Get crypto symbol
function getCryptoSymbol(crypto) {
    const symbols = {
        bitcoin: 'BTC',
        ethereum: 'ETH',
        usdt: 'USDT',
        usdc: 'USDC'
    };
    
    return symbols[crypto] || 'CRYPTO';
}

// Generate payment address
function generatePaymentAddress() {
    const selectedCrypto = cryptoPaymentState.selectedCrypto;
    
    // Generate mock addresses for demo purposes
    const addresses = {
        bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        ethereum: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        usdt: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        usdc: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    };
    
    cryptoPaymentState.paymentAddress = addresses[selectedCrypto];
    
    // Update payment status display
    document.getElementById('payment-address-text').textContent = cryptoPaymentState.paymentAddress;
    
    // Show payment status
    document.getElementById('crypto-payment-status').style.display = 'block';
    
    // Start payment timer
    startPaymentTimer();
    
    console.log('Generated payment address:', cryptoPaymentState.paymentAddress);
}

// Start payment timer
function startPaymentTimer() {
    let timeLeft = 15 * 60; // 15 minutes in seconds
    
    cryptoPaymentState.paymentTimer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        document.getElementById('payment-timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(cryptoPaymentState.paymentTimer);
            handlePaymentTimeout();
        }
        
        timeLeft--;
    }, 1000);
}

// Handle payment timeout
function handlePaymentTimeout() {
    showNotification('Payment session expired. Please try again.', 'error');
    document.getElementById('crypto-payment-status').style.display = 'none';
    cryptoPaymentState.paymentStatus = 'idle';
}

// Copy payment address to clipboard
function copyAddress() {
    if (cryptoPaymentState.paymentAddress) {
        navigator.clipboard.writeText(cryptoPaymentState.paymentAddress).then(() => {
            showNotification('Payment address copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Failed to copy address', 'error');
        });
    }
}

// Process crypto payment
async function processCryptoPayment() {
    if (!cryptoPaymentState.selectedWallet) {
        showNotification('Please select a wallet first', 'error');
        return false;
    }
    
    if (cryptoPaymentState.selectedWallet === 'manual') {
        const address = document.getElementById('crypto-address').value.trim();
        if (!address) {
            showNotification('Please enter your wallet address', 'error');
            return false;
        }
        if (!isValidCryptoAddress(address, cryptoPaymentState.selectedCrypto)) {
            showNotification('Please enter a valid wallet address', 'error');
            return false;
        }
    }
    
    try {
        // Generate payment address
        generatePaymentAddress();
        
        // Update payment status
        cryptoPaymentState.paymentStatus = 'waiting';
        
        // Show success notification
        showNotification('Payment address generated! Please send the exact amount.', 'success');
        
        // Simulate payment monitoring (in real implementation, this would check blockchain)
        setTimeout(() => {
            simulatePaymentConfirmation();
        }, 10000); // Simulate payment after 10 seconds
        
        return true;
        
    } catch (error) {
        console.error('Error processing crypto payment:', error);
        showNotification('Failed to process crypto payment', 'error');
        return false;
    }
}

// Validate crypto address format
function isValidCryptoAddress(address, crypto) {
    // Basic validation patterns
    const patterns = {
        bitcoin: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
        ethereum: /^0x[a-fA-F0-9]{40}$/,
        usdt: /^0x[a-fA-F0-9]{40}$/,
        usdc: /^0x[a-fA-F0-9]{40}$/
    };
    
    const pattern = patterns[crypto];
    return pattern ? pattern.test(address) : true;
}

// Simulate payment confirmation (for demo purposes)
function simulatePaymentConfirmation() {
    if (cryptoPaymentState.paymentStatus === 'waiting') {
        // Update status to confirmed
        cryptoPaymentState.paymentStatus = 'confirmed';
        
        // Update UI
        const statusIcon = document.querySelector('.status-icon');
        const statusText = document.querySelector('.status-text');
        
        if (statusIcon && statusText) {
            statusIcon.textContent = '✅';
            statusIcon.style.animation = 'none';
            statusText.textContent = 'Payment Confirmed!';
            statusText.style.color = 'var(--lab-neon)';
        }
        
        // Show success notification
        showNotification('Crypto payment confirmed! Processing your order...', 'success');
        
        // Clear timer
        if (cryptoPaymentState.paymentTimer) {
            clearInterval(cryptoPaymentState.paymentTimer);
        }
        
        // Process order after confirmation
        setTimeout(() => {
            processConfirmedCryptoPayment();
        }, 2000);
    }
}

// Process confirmed crypto payment
async function processConfirmedCryptoPayment() {
    try {
        // Get form data
        const formData = getFormData();
        
        // Update user profile with purchased plan
        await updateUserProfileWithPlan(window.selectedPlan);
        
        // Show success notification
        showNotification(`Crypto payment successful! Welcome to ${window.selectedPlan?.name}!`, 'success');
        
        // Show success modal
        showSuccessModal();
        
        // Store purchase info
        storePurchaseInfo(formData);
        
        // Redirect to dashboard after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
        
    } catch (error) {
        console.error('Error processing confirmed crypto payment:', error);
        showNotification('Error processing payment confirmation', 'error');
    }
}

// Update form submission to handle crypto payments
const originalHandleFormSubmission = handleFormSubmission;
handleFormSubmission = async function(event) {
    event.preventDefault();
    
    // Check if crypto payment is selected
    const activePaymentMethod = document.querySelector('.payment-method.active');
    if (activePaymentMethod && activePaymentMethod.dataset.method === 'crypto') {
        // Handle crypto payment
        const success = await processCryptoPayment();
        if (success) {
            return; // Don't proceed with regular form submission
        }
    }
    
    // Fall back to original payment processing
    return originalHandleFormSubmission.call(this, event);
};
