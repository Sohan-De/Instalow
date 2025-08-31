// Authentication Service for Instalow
class AuthService {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Wait for Supabase to be available
        if (typeof window !== 'undefined' && window.supabase) {
            this.supabase = window.supabase.createClient(
                'https://uwloajvooajxhffphjns.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bG9hanZvb2FqeGhmZnBoam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjUwNDYsImV4cCI6MjA3MDYwMTA0Nn0.fchJV646Yc1FgiWokclFlUMDJEtRW8X_j_I3TgskQxU'
            );
            
            // Set up auth state listener
            this.supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    this.currentUser = session?.user || null;
                    this.updateUIState(true);
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.updateUIState(false);
                }
            });

            // Check current session
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session) {
                this.currentUser = session.user;
                this.updateUIState(true);
            }
        }
    }

    // Sign Up with email and password
    async signUp(email, password, fullName) {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        created_at: new Date().toISOString()
                    }
                }
            });

            if (error) throw error;

            // Create user profile in profiles table
            if (data.user) {
                await this.createUserProfile(data.user, fullName);
            }

            return { success: true, data };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign In with email and password
    async signIn(email, password) {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.currentUser = data.user;
            this.updateUIState(true);
            return { success: true, data };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign Out
    async signOut() {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;

            this.currentUser = null;
            this.updateUIState(false);
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    // Create user profile in profiles table
    async createUserProfile(user, fullName) {
        try {
            const { error } = await this.supabase
                .from('profiles')
                .insert([
                    {
                        id: user.id,
                        email: user.email,
                        full_name: fullName,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ]);

            if (error) {
                console.error('Profile creation error:', error);
            }
        } catch (error) {
            console.error('Profile creation error:', error);
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser;
    }

    // Update UI state based on authentication
    updateUIState(isAuthenticated) {
        const guestState = document.querySelector('.guest-state');
        const loggedInState = document.querySelector('.logged-in-state');
        const profileName = document.querySelector('.profile-name');

        if (guestState && loggedInState) {
            if (isAuthenticated) {
                guestState.style.display = 'none';
                loggedInState.style.display = 'flex';
                
                if (profileName && this.currentUser) {
                    profileName.textContent = this.currentUser.email?.split('@')[0] || 'User';
                }
            } else {
                guestState.style.display = 'flex';
                loggedInState.style.display = 'none';
            }
        }

        // Update localStorage
        if (isAuthenticated) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', this.currentUser?.email || '');
        } else {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    }

    // Update user profile
    async updateProfile(updates) {
        try {
            if (!this.supabase || !this.currentUser) {
                throw new Error('User not authenticated');
            }

            const { error } = await this.supabase
                .from('profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.currentUser.id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get user profile
    async getUserProfile() {
        try {
            if (!this.supabase || !this.currentUser) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get profile error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize auth service
const authService = new AuthService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}
