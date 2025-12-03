import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { supabase, Profile } from './supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null; userId?: string }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Clear all auth-related storage
async function clearAuthStorage() {
  const keysToRemove = [
    'supabase.auth.token',
    'supabase-auth-token',
    'sb-ujgwbcxbglypvoztijgo-auth-token',
  ];
  
  for (const key of keysToRemove) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignore errors
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
    hasCompletedOnboarding: false,
  });

  // Fetch user profile
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile doesn't exist yet - that's okay for new users
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Exception fetching profile:', err);
      return null;
    }
  };

  // Create profile for new user
  const createProfile = async (userId: string, email: string, name: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          name: name,
          onboarding_completed: false,
          streak_count: 0,
          longest_streak: 0,
          notification_morning: true,
          notification_evening: true,
          notification_meals: true,
          notification_meds: true,
        });

      if (error) {
        console.error('Profile creation error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Exception creating profile:', err);
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('Session error:', error.message);
          if (mounted) {
            setState({
              user: null,
              session: null,
              profile: null,
              isLoading: false,
              isAuthenticated: false,
              hasCompletedOnboarding: false,
            });
          }
          return;
        }
        
        if (session?.user && mounted) {
          // Set authenticated immediately, fetch profile in background
          setState({
            user: session.user,
            session,
            profile: null,
            isLoading: false,
            isAuthenticated: true,
            hasCompletedOnboarding: true, // Assume true, will update if profile says otherwise
          });
          
          // Fetch profile in background (non-blocking)
          fetchProfile(session.user.id).then(profile => {
            if (mounted && profile) {
              setState(prev => ({
                ...prev,
                profile,
                hasCompletedOnboarding: profile.onboarding_completed ?? true,
              }));
            }
          }).catch(() => {
            // Profile fetch failed, but user is still authenticated
            console.log('Profile fetch failed, continuing with defaults');
          });
        } else if (mounted) {
          setState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
            hasCompletedOnboarding: false,
          });
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        
        if (mounted) {
          setState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
            hasCompletedOnboarding: false,
          });
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event);

        // Handle token refresh errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          setState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
            hasCompletedOnboarding: false,
          });
          return;
        }

        if (session?.user) {
          // Set authenticated immediately
          setState({
            user: session.user,
            session,
            profile: null,
            isLoading: false,
            isAuthenticated: true,
            hasCompletedOnboarding: true,
          });
          
          // Fetch profile in background
          fetchProfile(session.user.id).then(profile => {
            if (mounted && profile) {
              setState(prev => ({
                ...prev,
                profile,
                hasCompletedOnboarding: profile.onboarding_completed ?? true,
              }));
            }
          }).catch(() => {});
        } else {
          setState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
            hasCompletedOnboarding: false,
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Clear any old auth data first
      await clearAuthStorage();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name } // Store name in user metadata for trigger
        }
      });

      if (error) return { error };

      // Wait a moment for the auth to complete
      if (data.user) {
        // Small delay to ensure auth session is established
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if profile already exists (trigger may have created it)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (!existingProfile) {
          // Profile doesn't exist, try to create it
          const success = await createProfile(data.user.id, email, name);
          if (!success) {
            console.log('Profile creation failed, but user was created');
          }
        } else {
          console.log('Profile already exists (created by trigger)');
          // Update the name if needed
          await supabase
            .from('profiles')
            .update({ name: name })
            .eq('id', data.user.id);
        }
        
        // If we have a session (no email confirmation required)
        if (data.session) {
          // Fetch the profile
          const profile = await fetchProfile(data.user.id);
          
          // Update state to authenticated
          setState({
            user: data.user,
            session: data.session,
            profile: profile,
            isLoading: false,
            isAuthenticated: true,
            hasCompletedOnboarding: profile?.onboarding_completed ?? false,
          });
        } else {
          // No session means email confirmation might be required
          // Still set as authenticated for now (Supabase free tier often skips confirmation)
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            const profile = await fetchProfile(data.user.id);
            setState({
              user: data.user,
              session: sessionData.session,
              profile: profile,
              isLoading: false,
              isAuthenticated: true,
              hasCompletedOnboarding: profile?.onboarding_completed ?? false,
            });
          }
        }
      }

      return { error: null, userId: data.user?.id };
    } catch (err) {
      return { error: err as Error, userId: undefined };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) return { error };
      
      // Update state immediately after successful sign in
      if (data.user && data.session) {
        setState({
          user: data.user,
          session: data.session,
          profile: null,
          isLoading: false,
          isAuthenticated: true,
          hasCompletedOnboarding: true, // Assume true, fetch will update
        });
        
        // Fetch/create profile in background (non-blocking)
        fetchProfile(data.user.id).then(profile => {
          if (profile) {
            setState(prev => ({
              ...prev,
              profile,
              hasCompletedOnboarding: profile.onboarding_completed ?? true,
            }));
          } else {
            // Create profile in background
            createProfile(data.user!.id, email, email.split('@')[0]).catch(() => {});
          }
        }).catch(() => {
          console.log('Profile fetch failed during sign in');
        });
      }
      
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await clearAuthStorage();
    await supabase.auth.signOut();
    setState({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
    });
  };

  const refreshProfile = async () => {
    if (state.user) {
      const profile = await fetchProfile(state.user.id);
      setState(prev => ({
        ...prev,
        profile,
        hasCompletedOnboarding: profile?.onboarding_completed ?? false,
      }));
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id);

      if (!error) {
        await refreshProfile();
      }

      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
