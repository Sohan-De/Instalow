// Guide Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializeGuidePage();
    
    // Check authentication status
    checkAuthStatus();
    
    // Set up guide interactions
    setupGuideInteractions();
});

// Initialize the guide page
function initializeGuidePage() {
    console.log('Guide page initialized');
    
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
    
    // Add animation to guide items
    animateGuideItems();
    
    // Add hover effects to interactive elements
    setupHoverEffects();
}

// Animate guide items on page load
function animateGuideItems() {
    const guideItems = document.querySelectorAll('.guide-item, .feature-item, .tutorial-item, .trouble-item, .community-item');
    
    guideItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.6s ease-out';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Setup hover effects for interactive elements
function setupHoverEffects() {
    const interactiveItems = document.querySelectorAll('.guide-item, .feature-item, .tutorial-item, .trouble-item, .community-item');
    
    interactiveItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Open guide function
function openGuide(guideType) {
    const guideData = {
        'getting-started': {
            title: 'Getting Started Guide',
            content: 'Complete step-by-step guide to install and set up Instaflow...'
        },
        'configuration': {
            title: 'Basic Configuration Guide',
            content: 'Learn how to configure your display settings and preferences...'
        },
        'first-projection': {
            title: 'First Projection Guide',
            content: 'Create and run your first professional projection...'
        }
    };
    
    const guide = guideData[guideType];
    if (guide) {
        showGuideModal(guide.title, guide.content);
    }
}

// Show guide modal
function showGuideModal(title, content) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'guide-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeGuideModal()">×</button>
            </div>
            <div class="modal-body">
                <p>${content}</p>
                <div class="modal-actions">
                    <button class="modal-btn primary" onclick="closeGuideModal()">Got it!</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.classList.add('show');
    }, 100);
}

// Close guide modal
function closeGuideModal() {
    const modal = document.querySelector('.guide-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }
}

// Open troubleshooting function
function openTroubleshooting(issueType) {
    const issueData = {
        'common-issues': {
            title: 'Common Issues & Solutions',
            content: 'Solutions to frequently encountered problems...'
        },
        'performance': {
            title: 'Performance Optimization',
            content: 'Tips to optimize Instaflow for better performance...'
        },
        'hardware': {
            title: 'Hardware Compatibility',
            content: 'Ensure your system meets the requirements...'
        }
    };
    
    const issue = issueData[issueType];
    if (issue) {
        showTroubleshootingModal(issue.title, issue.content);
    }
}

// Show troubleshooting modal
function showTroubleshootingModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'troubleshooting-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeTroubleshootingModal()">×</button>
            </div>
            <div class="modal-body">
                <p>${content}</p>
                <div class="modal-actions">
                    <button class="modal-btn primary" onclick="closeTroubleshootingModal()">Understood</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 100);
}

// Close troubleshooting modal
function closeTroubleshootingModal() {
    const modal = document.querySelector('.troubleshooting-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }
}

// Open community function
function openCommunity(communityType) {
    const communityData = {
        'forum': {
            title: 'Community Forum',
            url: 'https://forum.instaflow.com',
            description: 'Join our community forum to connect with other users'
        },
        'discord': {
            title: 'Discord Server',
            url: 'https://discord.gg/instaflow',
            description: 'Join our Discord for real-time support and discussions'
        },
        'github': {
            title: 'GitHub Repository',
            url: 'https://github.com/instaflow/instaflow',
            description: 'Contribute to Instaflow development and report issues'
        }
    };
    
    const community = communityData[communityType];
    if (community) {
        // In a real implementation, you might want to show a confirmation dialog
        // For now, we'll just log the action
        console.log(`Opening ${community.title}: ${community.url}`);
        
        // Show a notification
        showNotification(`Opening ${community.title}...`);
        
        // Simulate opening the link (in real implementation, this would open the URL)
        setTimeout(() => {
            showNotification(`${community.title} opened successfully!`);
        }, 1000);
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'guide-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">ℹ️</span>
            <span class="notification-text">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Setup guide interactions
function setupGuideInteractions() {
    // Track guide interactions
    console.log('Guide page interactions set up');
    
    // Add click tracking to all guide items
    const guideItems = document.querySelectorAll('.guide-item, .feature-item, .tutorial-item, .trouble-item, .community-item');
    
    guideItems.forEach(item => {
        item.addEventListener('click', function() {
            console.log('Guide item clicked:', this.querySelector('h4')?.textContent || 'Unknown');
        });
    });
}

// Check authentication status
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userEmail = localStorage.getItem('userEmail');
    
    if (isLoggedIn && userEmail) {
        switchToLoggedInState(userEmail);
    } else {
        switchToGuestState();
    }
}

// Authentication state management
function switchToLoggedInState(email) {
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
    }
}

function switchToGuestState() {
    const guestState = document.querySelector('.guest-state');
    const loggedInState = document.querySelector('.logged-in-state');
    
    if (guestState && loggedInState) {
        guestState.style.display = 'flex';
        loggedInState.style.display = 'none';
    }
}

// Profile Menu Functions
function toggleProfileMenu() {
    const dropdown = document.querySelector('.profile-dropdown');
    const profileBtn = document.querySelector('.profile-btn');
    
    if (dropdown && profileBtn) {
        dropdown.classList.toggle('show');
        profileBtn.classList.toggle('active');
    }
}

function signOut() {
    // Show loading state
    const profileBtn = document.querySelector('.profile-btn');
    const originalText = profileBtn.innerHTML;
    profileBtn.innerHTML = '<span class="profile-avatar">⏳</span> <span class="profile-name">Signing Out...</span>';
    
    // Simulate logout process
    setTimeout(() => {
        // Clear local storage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        
        // Switch to guest state
        switchToGuestState();
        
        // Reset profile button
        profileBtn.innerHTML = originalText;
        
        // Close dropdown
        const dropdown = document.querySelector('.profile-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
        profileBtn.classList.remove('active');
        
        // Show success message
        alert('Signed out successfully!');
    }, 1000);
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const profileMenu = document.querySelector('.profile-menu');
    const dropdown = document.querySelector('.profile-dropdown');
    
    if (profileMenu && dropdown && !profileMenu.contains(e.target)) {
        dropdown.classList.remove('show');
        const profileBtn = document.querySelector('.profile-btn');
        if (profileBtn) {
            profileBtn.classList.remove('active');
        }
    }
});

// Logo click handler
function handleLogoClick() {
    console.log('Logo clicked, navigating to home page');
    window.location.href = 'index.html';
}

// Add CSS for modals and notifications
const modalStyles = `
    .guide-modal,
    .troubleshooting-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .guide-modal.show,
    .troubleshooting-modal.show {
        opacity: 1;
    }
    
    .modal-content {
        background: rgba(7, 27, 15, 0.95);
        backdrop-filter: blur(15px);
        border: 1px solid rgba(20, 255, 114, 0.3);
        border-radius: 16px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        transform: scale(0.9);
        transition: transform 0.3s ease;
    }
    
    .guide-modal.show .modal-content,
    .troubleshooting-modal.show .modal-content {
        transform: scale(1);
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(20, 255, 114, 0.2);
    }
    
    .modal-header h3 {
        color: var(--lab-gold);
        margin: 0;
        font-size: 1.5rem;
    }
    
    .modal-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .modal-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
    }
    
    .modal-body p {
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.6;
        margin-bottom: 1.5rem;
    }
    
    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }
    
    .modal-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .modal-btn.primary {
        background: linear-gradient(90deg, var(--lab-neon), var(--lab-gold));
        color: #071b0f;
    }
    
    .modal-btn.primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(20, 255, 114, 0.3);
    }
    
    .guide-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(20, 255, 114, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(20, 255, 114, 0.3);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        color: #071b0f;
        font-weight: 600;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 10px 25px rgba(20, 255, 114, 0.3);
    }
    
    .guide-notification.show {
        transform: translateX(0);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-icon {
        font-size: 1.2rem;
    }
    
    .notification-text {
        font-size: 0.9rem;
    }
`;

// Inject modal styles
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);

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
