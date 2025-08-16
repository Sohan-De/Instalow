# Partners Table Setup Guide

## 🎯 **What This Creates:**

### **📊 Table Structure:**
- **`id`**: Unique UUID for each partner
- **`name`**: Partner company name
- **`description`**: Partner description/details
- **`website_url`**: Partner's website link
- **`logo_url`**: Partner's logo image URL
- **`partner_type`**: Type of partnership (Technology, Agency, Platform, etc.)
- **`created_at`**: When partner was added
- **`updated_at`**: When partner was last updated

### **🔒 Security Features:**
- **Row Level Security (RLS)** enabled
- **Public read access** - anyone can view partners
- **Authenticated users** can add/edit/delete partners
- **Automatic timestamps** for tracking changes

### **📈 Performance:**
- **Indexes** on partner_type and created_at
- **Optimized queries** for better performance

## 🚀 **How to Use in Supabase:**

### **Option 1: SQL Editor**
1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Copy and paste the content from `create_partners_table.sql`
4. Click **Run** to execute

### **Option 2: Table Editor**
1. Go to **Table Editor** in Supabase
2. Click **Create new table**
3. Use the structure above to create manually

## 💾 **Sample Data Included:**
- **TechFlow Solutions** - Technology Partner
- **Growth Masters** - Agency Partner  
- **Meta Connect** - Platform Partner

## 🔄 **Next Steps:**
1. **Run the SQL** in your Supabase project
2. **Verify the table** was created successfully
3. **Check the sample data** is loaded
4. **Test the API** endpoints

## 📱 **Frontend Integration:**
The table is ready to be connected to your partners page for dynamic loading of partner information!

---
**File**: `create_partners_table.sql`
**Created**: For your Instaflow project
**Status**: Ready to execute in Supabase
