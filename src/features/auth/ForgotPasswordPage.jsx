import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import './auth.css';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await resetPassword(email);
    setLoading(false);
    if (err) return setError(err.message);
    setSuccess(true);
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
        <h2 className="auth-title">Reset password</h2>
        {success ? (
          <div className="auth-success">
            Check your email for a password reset link.
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-field">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
        <div className="auth-links">
          <Link to="/login">Back to sign in</Link>
          <span />
        </div>
      </div>
    </div>
  );
}
