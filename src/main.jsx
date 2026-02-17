import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './shared/context/AuthContext';
import './App.css';

const LandingPage = lazy(() => import('./features/main/LandingPage'));
const ArchApp = lazy(() => import('./features/arch/ArchApp'));
const GanttApp = lazy(() => import('./features/gantt/GanttApp'));
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./features/auth/ResetPasswordPage'));
const ConsolePage = lazy(() => import('./features/console/ConsolePage'));

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
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
