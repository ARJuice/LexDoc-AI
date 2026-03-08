import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthProvider, { useAuth } from './context/AuthProvider';
import AppLayout from './components/layout/AppLayout';
import CustomCursor from './components/ui/CustomCursor';
import SmoothScroll from './components/ui/SmoothScroll';

// Pages
import Login from './pages/Login';
import SetupAccount from './pages/SetupAccount';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import Upload from './pages/Upload';
import AIInsights from './pages/AIInsights';
import AdminUsers from './pages/AdminUsers';
import AdminDepartments from './pages/AdminDepartments';
import AdminAuditLogs from './pages/AdminAuditLogs';
import Profile from './pages/Profile';
import MyUploads from './pages/MyUploads';

// Protected Route wrapper — redirects to /login if not authenticated
function ProtectedRoute({ children, minAccessLevel = 0 }) {
  const { session, profile, loading, needsSetup } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', color: 'var(--color-text-muted)', fontSize: 'var(--fs-sm)'
      }}>
        Loading...
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (needsSetup) return <Navigate to="/setup-account" replace />;

  // Role-based access control
  if (minAccessLevel > 0 && profile) {
    const userAccessLevel = profile.roles?.access_level || 0;
    if (userAccessLevel < minAccessLevel) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

// Auth callback handler for Google OAuth redirect
function AuthCallback() {
  const navigate = useNavigate();
  const { session, loading, needsSetup } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate('/login', { replace: true });
    } else if (needsSetup) {
      navigate('/setup-account', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [session, loading, needsSetup, navigate]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', color: 'var(--color-text-muted)', fontSize: 'var(--fs-sm)'
    }}>
      Completing sign-in...
    </div>
  );
}

function AppContent() {
  const isDark = useSelector((s) => s.theme.isDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    localStorage.setItem('lexdoc-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <div>
      <SmoothScroll>
        <CustomCursor />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/setup-account" element={<SetupAccount />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes inside AppLayout */}
          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/:id" element={<DocumentDetail />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/my-uploads" element={<MyUploads />} />
            <Route path="/insights" element={<AIInsights />} />

            {/* Admin routes — require access_level >= 10 */}
            <Route path="/admin/users" element={
              <ProtectedRoute minAccessLevel={10}><AdminUsers /></ProtectedRoute>
            } />
            <Route path="/admin/departments" element={
              <ProtectedRoute minAccessLevel={10}><AdminDepartments /></ProtectedRoute>
            } />
            <Route path="/admin/audit" element={
              <ProtectedRoute minAccessLevel={10}><AdminAuditLogs /></ProtectedRoute>
            } />

            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </SmoothScroll>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
