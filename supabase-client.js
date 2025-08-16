// Supabase Client Configuration
const SUPABASE_URL = 'https://uwloajvooajxhffphjns.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bG9hanZvb2FqeGhmZnBoam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjUwNDYsImV4cCI6MjA3MDYwMTA0Nn0.fchJV646Yc1FgiWokclFlUMDJEtRW8X_j_I3TgskQxU';

// Initialize Supabase client
let supabase;

// Check if Supabase is available (for browser environment)
if (typeof window !== 'undefined' && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else if (typeof supabase !== 'undefined') {
    // For Node.js environment
    supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn('Supabase library not found. Please include the Supabase CDN script.');
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabase, SUPABASE_URL, SUPABASE_ANON_KEY };
}
