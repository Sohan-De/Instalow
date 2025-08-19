// Pricing Page JavaScript - Interactive Functionality

// Debug: Check if CSS is loaded
function checkCSSLoaded() {
    const cssStatus = document.getElementById('css-status');
    if (cssStatus) {
        // Check if our custom CSS is applied
        const testElement = document.createElement('div');
        testElement.style.cssText = 'position: absolute; left: -9999px;';
        testElement.className = 'pricing-card';
        document.body.appendChild(testElement);
        
        const computedStyle = window.getComputedStyle(testElement);
        const backgroundColor = computedStyle.backgroundColor;
        
        if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
            cssStatus.textContent = 'CSS Loaded ✅';
            cssStatus.style.color = 'green';
        } else {
            cssStatus.textContent = 'CSS Missing ❌';
            cssStatus.style.color = 'red';
        }
        
        document.body.removeChild(testElement);
    }
}

// Debug: Check if all sections are visible
function checkSectionsVisible() {
    const containerStatus = document.getElementById('container-status');
    const cardStatus = document.getElementById('card-status');
    const gridStatus = document.getElementById('grid-status');
    
    // Check container
    const container = document.querySelector('.pricing-container');
    if (container) {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            containerStatus.textContent = 'Visible ✅';
            containerStatus.style.color = 'green';
        } else {
            containerStatus.textContent = 'Hidden ❌';
            containerStatus.style.color = 'red';
        }
    }
    
    // Check pricing card
    const card = document.getElementById('pricing-card');
    if (card) {
        const rect = card.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            cardStatus.textContent = 'Visible ✅';
            cardStatus.style.color = 'green';
        } else {
            cardStatus.textContent = 'Hidden ❌';
            cardStatus.style.color = 'red';
        }
    }
    
    // Check pricing grid
    const grid = document.getElementById('pricing-grid');
    if (grid) {
        const rect = grid.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            gridStatus.textContent = 'Visible ✅';
            gridStatus.style.color = 'green';
        } else {
            gridStatus.textContent = 'Hidden ❌';
            gridStatus.style.color = 'red';
        }
    }
    
    // Check all sections
    const sections = ['pricing-header', 'pricing-grid', 'comparison-section', 'faq-section', 'cta-section'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const rect = section.getBoundingClientRect();
            console.log(`${sectionId}: width=${rect.width}, height=${rect.height}, visible=${rect.width > 0 && rect.height > 0}`);
            
            // Force visibility if hidden
            if (rect.width === 0 || rect.height === 0) {
                section.style.display = 'block';
                section.style.visibility = 'visible';
                section.style.opacity = '1';
                section.style.height = 'auto';
                section.style.width = '100%';
                console.log(`Forced visibility for ${sectionId}`);
            }
        }
    });
}

// Force all sections to be visible (emergency function)
function forceSectionsVisible() {
    const allSections = document.querySelectorAll('.pricing-container, .pricing-card, .pricing-header, .pricing-grid, .plan-card, .comparison-section, .faq-section, .cta-section');
    
    allSections.forEach(section => {
        section.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            height: auto !important;
            width: 100% !important;
            position: relative !important;
            z-index: 1 !important;
        `;
    });
    
    console.log('Forced all sections to be visible');
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

// Billing toggle functionality
function toggleBilling() {
    const billingToggle = document.getElementById('billingToggle');
    const isYearly = billingToggle.checked;
    
    // Update all plan prices
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach(card => {
        const amountElement = card.querySelector('.amount');
        const monthlyPrice = amountElement.getAttribute('data-monthly');
        const yearlyPrice = amountElement.getAttribute('data-yearly');
        
        if (isYearly) {
            amountElement.textContent = yearlyPrice;
            amountElement.style.color = '#e6c14a'; // Gold color for yearly
        } else {
            amountElement.textContent = monthlyPrice;
            amountElement.style.color = '#14ff72'; // Neon green for monthly
        }
    });
    
    // Add animation effect
    const amounts = document.querySelectorAll('.amount');
    amounts.forEach(amount => {
        amount.style.transform = 'scale(1.1)';
        setTimeout(() => {
            amount.style.transform = 'scale(1)';
        }, 200);
    });
    
    // Update save badge visibility
    const saveBadges = document.querySelectorAll('.save-badge');
    saveBadges.forEach(badge => {
        badge.style.opacity = isYearly ? '1' : '0.5';
        badge.style.transform = isYearly ? 'scale(1.1)' : 'scale(1)';
    });
}

// Plan selection functionality
function selectPlan(planType) {
    console.log(`Selected plan: ${planType}`);
    
    // Add loading state to button
    const button = event.target;
    const originalText = button.textContent;
    button.classList.add('loading');
    button.disabled = true;
    
    // Simulate processing delay
    setTimeout(() => {
        button.classList.remove('loading');
        button.disabled = false;
        button.textContent = originalText;
        
        // Navigate based on plan type
        switch(planType) {
            case 'free':
                // For free plan, just show success message
                showNotification('Free plan activated! Welcome to Instaflow!', 'success');
                break;
            case 'professional':
                // Navigate to checkout with professional plan
                window.location.href = `checkout.html?plan=professional&billing=${getBillingPeriod()}`;
                break;
            case 'enterprise':
                // Navigate to contact page for enterprise
                window.location.href = 'contact.html?plan=enterprise';
                break;
        }
    }, 1500);
}

// Get current billing period
function getBillingPeriod() {
    const billingToggle = document.getElementById('billingToggle');
    return billingToggle.checked ? 'yearly' : 'monthly';
}

// FAQ toggle functionality
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Toggle current item
    if (!isActive) {
        faqItem.classList.add('active');
    }
    
    // Add smooth animation
    faqItem.style.transition = 'all 0.4s ease';
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(20, 255, 114, 0.9)' : 'rgba(230, 193, 74, 0.9)'};
        color: #071b0f;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 350px;
        backdrop-filter: blur(10px);
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Profile menu functionality
function toggleProfileMenu() {
    const dropdown = document.getElementById('profile-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// Handle logout
async function handleLogout() {
    try {
        if (window.supabaseClient) {
            await window.supabaseClient.auth.signOut();
        }
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error during logout:', error);
        window.location.href = 'index.html';
    }
}

// Authentication state management
async function checkAuthState() {
    try {
        if (!window.supabaseClient) return;
        
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        
        if (session?.user) {
            // User is logged in
            document.querySelector('.guest-state').style.display = 'none';
            document.querySelector('.logged-in-state').style.display = 'block';
            
            // Update profile name
            const profileName = document.querySelector('.profile-name');
            if (profileName) {
                profileName.textContent = session.user.email?.split('@')[0] || 'User';
            }
            
            // Check admin status
            await checkAdminStatus();
        } else {
            // User is not logged in
            document.querySelector('.guest-state').style.display = 'flex';
            document.querySelector('.logged-in-state').style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking auth state:', error);
    }
}

// Close profile dropdown when clicking outside
document.addEventListener('click', function(event) {
    const profileMenu = document.querySelector('.profile-menu');
    const dropdown = document.getElementById('profile-dropdown');
    
    if (!profileMenu?.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

// Smooth scroll for anchor links
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

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    // Observe plan cards for staggered animation
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        observer.observe(card);
    });
    
    // Observe other sections
    const sections = document.querySelectorAll('.comparison-section, .faq-section, .cta-section');
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Check auth state
    checkAuthState();
    
    // Add event listeners for Supabase events
    if (window.supabaseClient) {
        window.supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                checkAuthState();
            }
        });
    }
});

// Hover effects removed - cards are no longer clickable

// Add ripple effect to buttons
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.plan-btn, .cta-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add ripple animation CSS
const rippleCSS = `
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
`;

const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Call admin check when Supabase is ready
window.addEventListener('supabase-ready', checkAdminStatus);

// Also check admin status when auth state changes
window.addEventListener('auth-state-changed', checkAdminStatus);

// Check admin status when page loads
document.addEventListener('DOMContentLoaded', checkAdminStatus);

// Add title shine animation
const titleShineCSS = `
@keyframes titleShine {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
`;

const titleStyle = document.createElement('style');
titleStyle.textContent = titleShineCSS;
document.head.appendChild(titleStyle);

// Initialize pricing page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pricing page loaded successfully!');
    
    // Check CSS loading status
    checkCSSLoaded();
    
    // Check if all sections are visible
    setTimeout(() => {
        checkSectionsVisible();
    }, 1000);
    
    // Emergency: Force all sections visible after 2 seconds
    setTimeout(() => {
        forceSectionsVisible();
    }, 2000);
    
    // Set initial billing state
    const billingToggle = document.getElementById('billingToggle');
    if (billingToggle) {
        billingToggle.checked = false; // Default to monthly
        toggleBilling(); // Initialize prices
    }
    
    // Add stagger animation to plan cards
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });
});
