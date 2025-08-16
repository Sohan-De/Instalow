# 🚀 Instalow + Supabase Setup Guide

This guide will help you connect your Instalow project with your Supabase backend.

## 📋 Prerequisites

- Your Supabase project URL: `https://uwloajvooajxhffphjns.supabase.co`
- Your Supabase anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bG9hanZvb2FqeGhmZnBoam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjUwNDYsImV4cCI6MjA3MDYwMTA0Nn0.fchJV646Yc1FgiWokclFlUMDJEtRW8X_j_I3TgskQxU`

## 🗄️ Step 1: Set Up Database Schema

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `uwloajvooajxhffphjns`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Database Schema**
   - Copy the entire content from `database-schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute

This will create:
- ✅ User profiles table
- ✅ Instagram accounts table
- ✅ Automation campaigns table
- ✅ Scheduled posts table
- ✅ Auto DM templates table
- ✅ Growth interactions table
- ✅ Analytics table
- ✅ Subscriptions table
- ✅ API keys table
- ✅ Audit logs table
- ✅ Row Level Security (RLS) policies
- ✅ Automatic timestamp updates

## 🔐 Step 2: Configure Authentication

1. **Go to Authentication Settings**
   - Click "Authentication" → "Settings" in the left sidebar

2. **Configure Email Auth**
   - Enable "Enable email confirmations" if you want email verification
   - Set "Secure email change" to your preference
   - Configure "Enable email confirmations" settings

3. **Set up Social Providers (Optional)**
   - Go to "Authentication" → "Providers"
   - Configure Google OAuth if desired
   - Configure GitHub OAuth if desired

4. **Configure Site URL**
   - Set your site URL (e.g., `http://localhost:3000` for development)
   - Add redirect URLs for authentication callbacks

## 🛡️ Step 3: Configure Row Level Security

The database schema already includes RLS policies, but verify they're working:

1. **Check RLS Status**
   - Go to "Table Editor"
   - Select any table (e.g., `profiles`)
   - Verify "RLS" is enabled (green toggle)

2. **Test Policies**
   - Try to insert/select data as an anonymous user
   - Should be blocked due to RLS policies

## 🧪 Step 4: Test the Integration

1. **Open your Instalow project**
   - Navigate to `auth.html`
   - Open browser developer tools (F12)

2. **Test Sign Up**
   - Fill out the sign-up form
   - Check console for Supabase connection logs
   - Verify user is created in Supabase

3. **Test Sign In**
   - Use the credentials from sign-up
   - Verify authentication works
   - Check that user state updates correctly

## 🔧 Step 5: Customize Authentication

### Update User Profile After Sign Up

The current setup creates a basic profile. You can enhance it by:

1. **Adding More Fields**
   ```sql
   ALTER TABLE profiles ADD COLUMN phone TEXT;
   ALTER TABLE profiles ADD COLUMN company TEXT;
   ALTER TABLE profiles ADD COLUMN website TEXT;
   ```

2. **Customizing Profile Creation**
   - Edit `auth-service.js` in the `createUserProfile` function
   - Add additional fields as needed

### Add Social Authentication

1. **Configure OAuth Providers**
   - Set up Google OAuth in Supabase
   - Set up GitHub OAuth in Supabase

2. **Update Frontend**
   - Modify `handleSocialAuth` function in `auth.js`
   - Use Supabase's social auth methods

## 📱 Step 6: Test Instagram Integration Features

1. **Create Test Instagram Account**
   - Sign up with a test email
   - Go to the dashboard (you'll need to create this)
   - Test adding Instagram account details

2. **Test Automation Features**
   - Create test campaigns
   - Schedule test posts
   - Test growth tools

## 🚨 Troubleshooting

### Common Issues

1. **"Supabase client not initialized"**
   - Check if Supabase CDN is loaded
   - Verify your project URL and anon key
   - Check browser console for errors

2. **"Authentication failed"**
   - Verify email/password are correct
   - Check if email confirmation is required
   - Verify RLS policies are working

3. **"Database connection failed"**
   - Check your Supabase project status
   - Verify database schema was created
   - Check RLS policies

4. **"RLS policy violation"**
   - Verify user is authenticated
   - Check RLS policies in Supabase dashboard
   - Ensure policies match your user structure

### Debug Steps

1. **Check Browser Console**
   - Look for JavaScript errors
   - Check network requests to Supabase

2. **Check Supabase Logs**
   - Go to "Logs" in Supabase dashboard
   - Look for authentication and database errors

3. **Test Database Directly**
   - Use Supabase's table editor
   - Try manual inserts/selects

## 🔒 Security Considerations

1. **Row Level Security**
   - All tables have RLS enabled
   - Users can only access their own data
   - Policies are restrictive by default

2. **API Keys**
   - Never expose your service role key
   - Use anon key for client-side operations
   - Implement proper validation on server-side

3. **Authentication**
   - Passwords are hashed by Supabase
   - Sessions are managed securely
   - Email verification can be enabled

## 📈 Next Steps

1. **Create Dashboard**
   - Build a user dashboard to manage Instagram accounts
   - Add campaign management interface
   - Implement analytics visualization

2. **Add Real Instagram API**
   - Integrate with Instagram Basic Display API
   - Implement real posting functionality
   - Add real-time analytics

3. **Implement Payment Processing**
   - Integrate Stripe for subscriptions
   - Add plan management
   - Implement usage limits

4. **Add Team Features**
   - Multi-user workspaces
   - Role-based permissions
   - Client management

## 📞 Support

If you encounter issues:

1. **Check Supabase Documentation**: https://supabase.com/docs
2. **Review Console Logs**: Look for error messages
3. **Verify Database Schema**: Ensure all tables were created
4. **Test Authentication Flow**: Step through sign-up/sign-in process

## 🎉 Congratulations!

You've successfully connected Instalow with Supabase! Your project now has:

- ✅ Real user authentication
- ✅ Secure database with RLS
- ✅ User profile management
- ✅ Instagram account tracking
- ✅ Automation campaign storage
- ✅ Analytics data storage
- ✅ Subscription management
- ✅ API key management
- ✅ Audit logging

Your Instagram automation platform is now ready for real users and data!
