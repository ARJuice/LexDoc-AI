import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                navigate('/dashboard');
            } else if (event === 'SIGNED_OUT') {
                navigate('/login');
            }
        });
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
