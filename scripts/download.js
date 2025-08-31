// Download Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializeDownloadPage();
    
    // Check authentication status
    checkAuthStatus();
    
    // Set up download tracking
    setupDownloadTracking();
});

// Initialize the download page
function initializeDownloadPage() {
    console.log('Download page initialized');
    
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
    
    // Add animation to download options
    animateDownloadOptions();
    
    // Add hover effects to additional downloads
    setupAdditionalDownloads();
}

// Animate download options on page load
function animateDownloadOptions() {
    const downloadOptions = document.querySelectorAll('.download-option');
    
    downloadOptions.forEach((option, index) => {
        option.style.opacity = '0';
        option.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            option.style.transition = 'all 0.6s ease-out';
            option.style.opacity = '1';
            option.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Setup additional downloads hover effects
function setupAdditionalDownloads() {
    const additionalItems = document.querySelectorAll('.additional-item');
    
    additionalItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Download file function
function downloadFile(platform) {
    // Show loading state
    const button = event.target.closest('.download-btn') || event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="btn-text">Downloading...</span> <span class="btn-icon">⏳</span>';
    button.disabled = true;
    
    // Simulate download process
    setTimeout(() => {
        // Track download
        trackDownload(platform);
        
        // Show success message
        showDownloadSuccess(platform);
        
        // Reset button
        button.innerHTML = originalText;
        button.disabled = false;
        
        // Simulate actual download (in real implementation, this would trigger file download)
        simulateFileDownload(platform);
        
    }, 2000);
}

// Track download analytics
function trackDownload(platform) {
    const downloadData = {
        platform: platform,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
    };
    
    console.log('Download tracked:', downloadData);
    
    // In a real implementation, you would send this data to your analytics service
    // Example: sendToAnalytics('download', downloadData);
}

// Show download success message
function showDownloadSuccess(platform) {
    const platformNames = {
        'windows': 'Windows',
        'macos': 'macOS',
        'linux': 'Linux',
        'manual': 'User Manual',
        'samples': 'Sample Templates',
        'plugins': 'Plugin Pack'
    };
    
    const platformName = platformNames[platform] || platform;
    
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'download-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✅</span>
            <span class="notification-text">${platformName} download started successfully!</span>
        </div>
    `;
    
    // Add notification to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Simulate file download
function simulateFileDownload(platform) {
    const downloadLinks = {
        'windows': '#',
        'macos': '#',
        'linux': '#',
        'manual': '#',
        'samples': '#',
        'plugins': '#'
    };
    
    // In a real implementation, this would trigger the actual file download
    // For now, we'll just log the action
    console.log(`Simulating download for ${platform}`);
    
    // Example of how to trigger actual download:
    // const link = document.createElement('a');
    // link.href = downloadLinks[platform];
    // link.download = `instaflow-${platform}.zip`;
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
}

// Setup download tracking
function setupDownloadTracking() {
    // Track page view
    console.log('Download page viewed');
    
    // Add click tracking to all download buttons
    const downloadButtons = document.querySelectorAll('.download-btn, .additional-item');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.getAttribute('onclick')?.match(/downloadFile\('([^']+)'\)/)?.[1] || 'unknown';
            console.log(`Download button clicked for: ${platform}`);
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
    const dropdown = document.getElementById('profile-dropdown');
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
        const dropdown = document.getElementById('profile-dropdown');
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
    const dropdown = document.getElementById('profile-dropdown');
    
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

// Add CSS for download notification
const notificationStyles = `
    .download-notification {
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
    
    .download-notification.show {
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

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
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
