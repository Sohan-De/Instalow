// EmailJS Configuration for Instaflow
// This handles sending emails with keys when payments are successful

// EmailJS configuration
const EMAILJS_CONFIG = {
    serviceId: 'service_au52yrj', // Your correct EmailJS service ID
    templateId: 'template_1e6hbnr', // Your correct template ID
    userId: 'e58yoorl3LASDk8bj', // Your user ID is correct
    adminEmail: 'romankhanrajib9@gmail.com' // Admin email - change this to your email
};

// Initialize EmailJS
function initializeEmailJS() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.userId);
        console.log('✅ EmailJS initialized successfully');
        return true;
    } else {
        console.error('❌ EmailJS library not loaded');
        return false;
    }
}

// Send payment success email with key
async function sendPaymentSuccessEmail(userEmail, userName, planName, amount, keyValue) {
    try {
        if (!initializeEmailJS()) {
            throw new Error('EmailJS not available');
        }

        console.log('📧 Sending payment success emails...');

        // Send email to user
        const userTemplateParams = {
            to_email: userEmail,
            to_name: userName,
            plan_name: planName,
            amount: amount,
            key_value: keyValue,
            company_name: 'Instaflow',
            support_email: 'support@instaflow.com',
            website_url: window.location.origin
        };

        // Send email to admin
        const adminTemplateParams = {
            to_email: EMAILJS_CONFIG.adminEmail,
            to_name: 'Admin',
            plan_name: planName,
            amount: amount,
            key_value: keyValue,
            company_name: 'Instaflow',
            support_email: 'support@instaflow.com',
            website_url: window.location.origin,
            user_email: userEmail,
            user_name: userName
        };

        // Send both emails
        const [userResponse, adminResponse] = await Promise.all([
            emailjs.send(
                EMAILJS_CONFIG.serviceId,
                EMAILJS_CONFIG.templateId,
                userTemplateParams
            ),
            emailjs.send(
                EMAILJS_CONFIG.serviceId,
                EMAILJS_CONFIG.templateId,
                adminTemplateParams
            )
        ]);

        console.log('✅ User email sent:', userResponse);
        console.log('✅ Admin email sent:', adminResponse);
        
        return { 
            success: true, 
            message: 'Emails sent successfully',
            userEmailSent: true,
            adminEmailSent: true
        };

    } catch (error) {
        console.error('❌ Failed to send payment success emails:', error);
        return { success: false, message: error.message };
    }
}

// Get available key from Supabase and mark as used
async function getAndMarkKeyAsUsed() {
    try {
        if (!window.supabaseClient) {
            throw new Error('Supabase client not available');
        }

        console.log('🔑 Getting available key from database...');

        // Get first available key
        const { data: keys, error: fetchError } = await window.supabaseClient
            .from('keys')
            .select('key_id, key_value')
            .eq('marked_as_used', false)
            .limit(1)
            .single();

        if (fetchError) {
            throw new Error('No available keys found');
        }

        if (!keys) {
            throw new Error('No available keys in database');
        }

        console.log('✅ Found available key:', keys);

        // Mark key as used
        const { error: updateError } = await window.supabaseClient
            .from('keys')
            .update({ marked_as_used: true })
            .eq('key_id', keys.key_id);

        if (updateError) {
            throw new Error('Failed to mark key as used');
        }

        console.log('✅ Key marked as used successfully');

        return {
            success: true,
            keyId: keys.key_id,
            keyValue: keys.key_value
        };

    } catch (error) {
        console.error('❌ Failed to get and mark key:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// Complete payment process with email and key
async function completePaymentWithKey(userEmail, userName, planName, amount) {
    try {
        console.log('💳 Completing payment process...');

        // Step 1: Get available key and mark as used
        const keyResult = await getAndMarkKeyAsUsed();
        
        if (!keyResult.success) {
            throw new Error('Failed to get key: ' + keyResult.message);
        }

        // Step 2: Send email with key
        const emailResult = await sendPaymentSuccessEmail(
            userEmail, 
            userName, 
            planName, 
            amount, 
            keyResult.keyValue
        );

        if (!emailResult.success) {
            // If email fails, mark key as available again
            await markKeyAsAvailableAgain(keyResult.keyId);
            throw new Error('Failed to send email: ' + emailResult.message);
        }

        console.log('✅ Payment completed successfully with key:', keyResult.keyValue);
        
        return {
            success: true,
            keyValue: keyResult.keyValue,
            message: 'Payment completed and email sent successfully'
        };

    } catch (error) {
        console.error('❌ Payment completion failed:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// Mark key as available again (fallback if email fails)
async function markKeyAsAvailableAgain(keyId) {
    try {
        if (!window.supabaseClient) return;

        const { error } = await window.supabaseClient
            .from('keys')
            .update({ marked_as_used: false })
            .eq('key_id', keyId);

        if (error) {
            console.error('❌ Failed to mark key as available again:', error);
        } else {
            console.log('✅ Key marked as available again for fallback');
        }
    } catch (error) {
        console.error('❌ Fallback key reset failed:', error);
    }
}

// Test function to debug EmailJS
async function testEmailJS() {
    try {
        console.log('🧪 Testing EmailJS...');
        
        // Test 1: Check if EmailJS is loaded
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS library not loaded');
        }
        console.log('✅ EmailJS library loaded');
        
        // Test 2: Initialize EmailJS
        if (!initializeEmailJS()) {
            throw new Error('EmailJS initialization failed');
        }
        console.log('✅ EmailJS initialized');
        
        // Test 3: Send test email
        const result = await sendPaymentSuccessEmail(
            'test@example.com', // Test email
            'Test User',         // Test name
            'Professional Plan', // Test plan
            '$49.99',            // Test amount
            'TEST123456789ABCD'  // Test key
        );
        
        if (result.success) {
            console.log('✅ Test emails sent successfully!');
            const emailStatus = [];
            if (result.userEmailSent) emailStatus.push('User email sent');
            if (result.adminEmailSent) emailStatus.push('Admin notified');
            
            alert(`Test emails sent! ${emailStatus.join(', ')}. Check your inboxes.`);
        } else {
            throw new Error('Test email failed: ' + result.message);
        }
        
    } catch (error) {
        console.error('❌ EmailJS test failed:', error);
        alert('EmailJS test failed: ' + error.message);
    }
}

// Export functions for use in other files
window.EmailJSFunctions = {
    initializeEmailJS,
    sendPaymentSuccessEmail,
    getAndMarkKeyAsUsed,
    completePaymentWithKey,
    testEmailJS
};
