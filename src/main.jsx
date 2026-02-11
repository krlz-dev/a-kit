import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import './App.css';

const LandingPage = lazy(() => import('./features/main/LandingPage'));
const ArchApp = lazy(() => import('./features/arch/ArchApp'));
const GanttApp = lazy(() => import('./features/gantt/GanttApp'));

const Loading = () => (
  <div style={{
    height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#080c08', color: '#c8e600', fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 14, fontWeight: 600,
  }}>
    Loading…
  </div>
);

const router = createHashRouter([
  { path: '/', element: <Suspense fallback={<Loading />}><LandingPage /></Suspense> },
  { path: '/arch', element: <Suspense fallback={<Loading />}><ArchApp /></Suspense> },
  { path: '/gantt', element: <Suspense fallback={<Loading />}><GanttApp /></Suspense> },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
