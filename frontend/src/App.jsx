import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthProvider, { useAuth } from './context/AuthProvider';
import AppLayout from './components/layout/AppLayout';
import CustomCursor from './components/ui/CustomCursor';
import SmoothScroll from './components/ui/SmoothScroll';

// Lazy-loaded pages — each becomes its own chunk
const Login = lazy(() => import('./pages/Login'));
const SetupAccount = lazy(() => import('./pages/SetupAccount'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Documents = lazy(() => import('./pages/Documents'));
const DocumentDetail = lazy(() => import('./pages/DocumentDetail'));
const Upload = lazy(() => import('./pages/Upload'));
const AIInsights = lazy(() => import('./pages/AIInsights'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminDepartments = lazy(() => import('./pages/AdminDepartments'));
const AdminAuditLogs = lazy(() => import('./pages/AdminAuditLogs'));
const Profile = lazy(() => import('./pages/Profile'));
const MyUploads = lazy(() => import('./pages/MyUploads'));

// Loading fallback
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', color: 'var(--color-text-muted)', fontSize: 'var(--fs-sm)',
      gap: '8px',
    }}>
      <span className="spinner" /> Loading...
    </div>
  );
}

// Protected Route wrapper — redirects to /login if not authenticated
function ProtectedRoute({ children, minAccessLevel = 0 }) {
  const { session, profile, loading, needsSetup } = useAuth();

  if (loading) return <PageLoader />;
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

  return <PageLoader />;
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
        <Suspense fallback={<PageLoader />}>
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
              <Route path="/upload" element={
                <ProtectedRoute minAccessLevel={5}><Upload /></ProtectedRoute>
              } />
              <Route path="/my-uploads" element={
                <ProtectedRoute minAccessLevel={5}><MyUploads /></ProtectedRoute>
              } />
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
        </Suspense>
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
