import { useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabase';

export default function AccountTab() {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) return setError(err.message);
    setSuccess('Password updated');
    setPassword('');
    setConfirm('');
  };

  return (
    <div className="account-section">
      <div className="account-info">
        Email: <span>{user?.email}</span>
      </div>

      <h3>Change password</h3>
      <form className="auth-form" onSubmit={handleChangePassword}>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        <div className="auth-field">
          <label>New password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div className="auth-field">
          <label>Confirm new password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        </div>
        <button className="auth-submit" type="submit" disabled={loading} style={{ maxWidth: 200 }}>
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
