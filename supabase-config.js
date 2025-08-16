// Supabase Configuration
const SUPABASE_URL = 'https://uwloajvooajxhffphjns.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bG9hanZvb2FqeGhmZnBoam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjUwNDYsImV4cCI6MjA3MDYwMTA0Nn0.fchJV646Yc1FgiWokclFlUMDJEtRW8X_j_I3TgskQxU';

// Initialize Supabase client when library is available
let supabase = null;

function initializeSupabase() {
    try {
        if (typeof window.supabase !== 'undefined') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            // Make it globally available
            window.supabaseClient = supabase;
            console.log('Supabase client initialized successfully');
            console.log('Global client available as window.supabaseClient');
            
            // Dispatch event for other scripts
            document.dispatchEvent(new CustomEvent('supabase-ready'));
            return true;
        } else {
            console.warn('Supabase library not yet loaded');
            return false;
        }
    } catch (error) {
        console.error('Error initializing Supabase client:', error);
        return false;
    }
}

// Try to initialize immediately
if (typeof window.supabase !== 'undefined') {
    initializeSupabase();
} else {
    // Wait for library to load
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof window.supabase !== 'undefined') {
            initializeSupabase();
        }
    });
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabase, SUPABASE_URL, SUPABASE_ANON_KEY };
}

// Fallback: ensure Supabase is available after a short delay
setTimeout(() => {
    if (!window.supabaseClient && typeof window.supabase !== 'undefined') {
        console.log('Fallback: Initializing Supabase client...');
        initializeSupabase();
    }
}, 1000);
