# 📧 EmailJS Setup Guide for Instaflow

This guide will help you set up EmailJS to automatically send emails with activation keys when users complete payments.

## 🚀 Step 1: Sign Up for EmailJS

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Create a free account
3. Verify your email address

## ⚙️ Step 2: Create Email Service

1. **Go to Email Services** in your EmailJS dashboard
2. **Add New Service**
3. **Choose your email provider** (Gmail, Outlook, etc.)
4. **Connect your email account**
5. **Copy the Service ID** (you'll need this)

## 📝 Step 3: Create Email Template

1. **Go to Email Templates** in your EmailJS dashboard
2. **Create New Template**
3. **Use the HTML code** from `emailjs-template-example.html`
4. **Save the template**
5. **Copy the Template ID** (you'll need this)

## 🔑 Step 4: Get Your User ID

1. **Go to Account** in your EmailJS dashboard
2. **Copy your Public Key** (User ID)

## ⚡ Step 5: Update Configuration

1. **Open `emailjs-config.js`**
2. **Replace these values:**

```javascript
const EMAILJS_CONFIG = {
    serviceId: 'YOUR_ACTUAL_SERVICE_ID',      // From Step 2
    templateId: 'YOUR_ACTUAL_TEMPLATE_ID',    // From Step 3
    userId: 'YOUR_ACTUAL_USER_ID'             // From Step 4
};
```

## 📱 Step 6: Add EmailJS to Your HTML

Add this script tag to your checkout page (`checkout.html`):

```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
<script src="emailjs-config.js"></script>
```

## 💳 Step 7: Integrate with Payment Success

In your payment success handler, call this function:

```javascript
// When payment is successful
const result = await EmailJSFunctions.completePaymentWithKey(
    userEmail,        // User's email
    userName,         // User's name
    planName,         // Plan name (e.g., "Professional")
    amount            // Payment amount
);

if (result.success) {
    console.log('✅ Payment completed with key:', result.keyValue);
    // Show success message to user
} else {
    console.error('❌ Payment failed:', result.message);
    // Handle error
}
```

## 🎯 How It Works

1. **User completes payment** → Stripe confirms success
2. **System gets available key** → From your Supabase keys table
3. **Key marked as used** → Prevents duplicate usage
4. **Email sent** → With the activation key
5. **User receives email** → With their unique 16-digit key

## 🔧 Testing

1. **Add some test keys** to your Supabase keys table
2. **Test the email function** with a test email
3. **Verify key status** changes from Available to Used
4. **Check email delivery** in your inbox

## 📊 Email Template Variables

Your email template can use these variables:

- `{{to_name}}` - User's name
- `{{to_email}}` - User's email
- `{{plan_name}}` - Subscription plan name
- `{{amount}}` - Payment amount
- `{{key_value}}` - 16-digit activation key
- `{{company_name}}` - Instaflow
- `{{support_email}}` - Support email
- `{{website_url}}` - Your website URL

## 🚨 Important Notes

- **Keys are automatically marked as used** when sent
- **If email fails, key is marked as available again**
- **Each key can only be used once**
- **Monitor your key inventory** in the admin dashboard

## 🆘 Troubleshooting

### Email not sending?
- Check EmailJS configuration
- Verify service and template IDs
- Check browser console for errors

### No keys available?
- Add more keys in admin dashboard
- Check key status in Supabase

### Payment success but no email?
- Check EmailJS logs
- Verify user email is valid
- Check spam folder

## 🎉 Success!

Once set up, users will automatically receive beautiful emails with their activation keys every time they complete a payment!

---

**Need help?** Check the EmailJS documentation or contact support.
