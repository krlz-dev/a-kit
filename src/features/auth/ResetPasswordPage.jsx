import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../shared/lib/supabase';
import './auth.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    // Also mark ready if user is already authenticated (token in URL was processed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) return setError(err.message);
    setSuccess(true);
    setTimeout(() => navigate('/console'), 2000);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <a href="#/" className="auth-logo">
          <svg viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="#080c08"/>
            <path d="M18 16l-2 2-2-2 2-2 2 2zm-2-6l2.12 2.12 2.5-2.5L16 5l-4.62 4.62 2.5 2.5L16 10zm-6 6l2.12-2.12-2.5-2.5L5 16l4.62 4.62 2.5-2.5L10 16zm12 0l-2.12 2.12 2.5 2.5L27 16l-4.62-4.62-2.5 2.5L22 16zm-6 6l-2.12-2.12-2.5 2.5L16 27l4.62-4.62-2.5-2.5L16 22z" fill="#c8e600"/>
          </svg>
          kit-a
        </a>
        <h2 className="auth-title">Set new password</h2>
        {success ? (
          <div className="auth-success">
            Password updated. Redirecting to console…
          </div>
        ) : !ready ? (
          <div className="auth-error">
            Invalid or expired reset link. Please request a new one.
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-field">
              <label>New password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus />
            </div>
            <div className="auth-field">
              <label>Confirm new password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
