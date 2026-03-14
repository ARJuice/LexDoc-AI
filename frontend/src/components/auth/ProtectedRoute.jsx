import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';

export default function ProtectedRoute() {
    const { session, loading, profile, needsSetup } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Establishing secure connection...</p>
            </div>
        );
    }

    if (!session) {
        // Redirect to login but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (needsSetup && location.pathname !== '/setup-account') {
        return <Navigate to="/setup-account" replace />;
    }

    return <Outlet />;
}
