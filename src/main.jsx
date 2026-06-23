import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import './App.css';

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

const KitApp = lazyRetry(() => import('./features/kit/KitApp'));

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
  { path: '/', element: wrap(KitApp) },
  { path: '*', element: <Navigate to="/" replace /> },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
