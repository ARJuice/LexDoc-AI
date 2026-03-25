import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logUserAuth } from '../lib/supabaseData';

const AuthContext = createContext(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

const ALLOWED_DOMAIN = 'sahrdaya.ac.in';

export default function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    // Fetch the user profile from the public.users table
    const fetchProfile = useCallback(async (email) => {
        const { data, error } = await supabase
            .from('users')
            .select('*, roles(*), departments(*)')
            .eq('email', email)
            .maybeSingle();
        
        if (error) {
            console.error('fetchProfile error:', error);
            throw error; // Throw to let callers know it failed (e.g., offline)
        }
        return data; // Returns object if found, or null if not registered
    }, []);

    // On mount + auth state changes
    useEffect(() => {
        // Get current session initially
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s);
            if (s?.user?.email) {
                const domain = s.user.email.split('@')[1];
                if (domain !== ALLOWED_DOMAIN) {
                    setAuthError(`Only @${ALLOWED_DOMAIN} accounts are allowed.`);
                    supabase.auth.signOut();
                    setSession(null);
                    setLoading(false);
                    return;
                }
                fetchProfile(s.user.email)
                    .then(p => setProfile(p))
                    .catch(() => { /* Keep profile null/old on initial failure */ })
                    .finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        // Listen for token refreshes or logins
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s);
            if (s?.user?.email) {
                const domain = s.user.email.split('@')[1];
                if (domain !== ALLOWED_DOMAIN) {
                    setAuthError(`Only @${ALLOWED_DOMAIN} accounts are allowed.`);
                    supabase.auth.signOut();
                    setSession(null);
                    setProfile(null);
                    return;
                }
                setAuthError(null);
                
                // When waking from sleep, network might be down. Don't wipe existing profile on error.
                fetchProfile(s.user.email)
                    .then(p => {
                        setProfile(p);
                        if (_event === 'SIGNED_IN' && p) {
                            logUserAuth(p.id, 'Logged in via Google/Email');
                        }
                    })
                    .catch(err => {
                        console.error("Profile refresh failed (likely offline). Retaining existing profile.");
                        // Do not call setProfile(null) here!
                    });
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    const signInWithGoogle = useCallback(async () => {
        setAuthError(null);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/auth/callback',
            },
        });
        if (error) setAuthError(error.message);
    }, []);

    const signInWithPassword = useCallback(async (email, password) => {
        setAuthError(null);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setAuthError(error.message);
            return false;
        }
        return true;
    }, []);

    const signOut = useCallback(async () => {
        if (profile?.id) {
            await logUserAuth(profile.id, 'Logged out');
        }
        await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
    }, [profile]);

    const refreshProfile = useCallback(() => {
        if (session?.user?.email) {
            return fetchProfile(session.user.email)
                .then(p => { setProfile(p); return p; })
                .catch(err => { console.error('Refresh failed', err); return profile; });
        }
        return Promise.resolve();
    }, [session, fetchProfile, profile]);

    // Check if the user needs to set up their account (Google verified but no public.users row)
    const needsSetup = session && !loading && !profile;

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        session,
        profile,
        loading,
        authError,
        setAuthError,
        needsSetup,
        signInWithGoogle,
        signInWithPassword,
        signOut,
        refreshProfile,
    }), [session, profile, loading, authError, needsSetup, signInWithGoogle, signInWithPassword, signOut, refreshProfile]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
