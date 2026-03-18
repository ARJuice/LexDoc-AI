import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                navigate('/dashboard', { replace: true });
            } else if (event === 'SIGNED_OUT') {
                navigate('/login', { replace: true });
            }
        });
        return () => subscription.unsubscribe();
    }, [navigate]);

    return (
        <div className="auth-callback-page">
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Finalizing authentication...</p>
            </div>
        </div>
    );
}
