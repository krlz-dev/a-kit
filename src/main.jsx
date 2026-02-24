import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/context/AuthContext';
import { supabase } from './shared/lib/supabase';
import './App.css';

// Supabase redirects after email verification with tokens in the URL fragment
// e.g. #access_token=…&refresh_token=…&type=signup
// This conflicts with createHashRouter which also uses the hash for routing.
// Extract the tokens, clean the hash for the router, and set the session manually.
const _hash = window.location.hash.substring(1);
if (_hash && !_hash.startsWith('/') && _hash.includes('access_token=')) {
  const params = new URLSearchParams(_hash);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  const type = params.get('type');
  const route = type === 'recovery' ? '#/reset-password' : '#/';
  history.replaceState(null, '', window.location.pathname + route);
  if (access_token && refresh_token) {
    supabase.auth.setSession({ access_token, refresh_token });
  }
}

// Retry dynamic imports once by reloading to get fresh chunk hashes after deploy
const lazyRetry = (importFn) => lazy(() =>
  importFn().catch(() => {
    const reloaded = sessionStorage.getItem('chunk_reload');
    if (!reloaded) {
      sessionStorage.setItem('chunk_reload', '1');
      window.location.reload();
      return new Promise(() => {}); // never resolves — page is reloading
    }
    sessionStorage.removeItem('chunk_reload');
    return importFn(); // second attempt, let it fail naturally if still broken
  })
);

const LandingPage = lazyRetry(() => import('./features/main/LandingPage'));
const ArchApp = lazyRetry(() => import('./features/arch/ArchApp'));
const GanttApp = lazyRetry(() => import('./features/gantt/GanttApp'));
const LoginPage = lazyRetry(() => import('./features/auth/LoginPage'));
const RegisterPage = lazyRetry(() => import('./features/auth/RegisterPage'));
const ForgotPasswordPage = lazyRetry(() => import('./features/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazyRetry(() => import('./features/auth/ResetPasswordPage'));
const ConsolePage = lazyRetry(() => import('./features/console/ConsolePage'));

const Loading = () => (
  <div style={{
    height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#080c08', color: '#c8e600', fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 14, fontWeight: 600,
  }}>
    Loading…
  </div>
);

const wrap = (Component) => (
  <Suspense fallback={<Loading />}><Component /></Suspense>
);

const router = createHashRouter([
  { path: '/', element: wrap(LandingPage) },
  { path: '/arch', element: wrap(ArchApp) },
  { path: '/arch/:projectId', element: wrap(ArchApp) },
  { path: '/gantt', element: wrap(GanttApp) },
  { path: '/gantt/:projectId', element: wrap(GanttApp) },
  { path: '/login', element: wrap(LoginPage) },
  { path: '/register', element: wrap(RegisterPage) },
  { path: '/forgot-password', element: wrap(ForgotPasswordPage) },
  { path: '/reset-password', element: wrap(ResetPasswordPage) },
  { path: '/console', element: wrap(ConsolePage) },
  { path: '/console/:tab', element: wrap(ConsolePage) },
  { path: '*', element: <Navigate to="/" replace /> },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
