import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#080c08', color: '#c8e600', fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 14, fontWeight: 600,
      }}>
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
