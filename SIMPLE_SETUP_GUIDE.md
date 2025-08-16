# Simple Instalow Profile Setup Guide

This guide will help you set up just the profiles table in Supabase and connect it to your website.

## Step 1: Run the Database Schema

1. Go to your Supabase project: https://uwloajvooajxhffphjns.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Copy the entire content of `database-schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:
- ✅ `profiles` table with proper structure
- ✅ Row Level Security (RLS) policies
- ✅ Automatic timestamp updates
- ✅ Proper permissions

## Step 2: Test the Profile Page

1. Open `profile.html` in your browser
2. If you're not logged in, it will redirect you to `auth.html`
3. Sign in with your account
4. The profile page will automatically:
   - Load your existing profile data
   - Create a new profile if none exists
   - Allow you to edit your information

## Step 3: Access Profile from Main Site

1. Go to your main site (`index.html`)
2. Sign in with your account
3. Click on your profile button (top right)
4. Click "Profile" in the dropdown menu
5. You'll be taken to the profile management page

## What the Profile System Does

- **Automatic Profile Creation**: When a user signs up, a profile is automatically created
- **Secure Access**: Users can only see and edit their own profile (RLS enforced)
- **Real-time Updates**: Changes are saved immediately to Supabase
- **Responsive Design**: Works on all devices

## Troubleshooting

### If you get "table doesn't exist" errors:
- Make sure you ran the SQL schema in Supabase
- Check that the `profiles` table was created in the "Table Editor"

### If you get permission errors:
- Make sure RLS policies were created correctly
- Check that the `GRANT` statements were executed

### If the profile page doesn't load:
- Check the browser console for JavaScript errors
- Verify your Supabase URL and API key are correct
- Make sure you're signed in to the website

## Next Steps

Once the basic profile system is working, you can:
1. Add more fields to the profiles table
2. Create additional tables for Instagram accounts, campaigns, etc.
3. Build more features like analytics and automation tools

## Files Created/Modified

- ✅ `database-schema.sql` - Simple profiles table schema
- ✅ `profile.html` - Profile management page
- ✅ `profile.js` - Profile functionality
- ✅ `index.html` - Added profile link to navigation
- ✅ `auth.html` - Already has Supabase integration
- ✅ `auth.js` - Already has Supabase integration
- ✅ `script.js` - Already has Supabase integration

Your Instalow project now has a working profile system connected to Supabase! 🎉
