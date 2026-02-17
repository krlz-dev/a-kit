import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchSubscription } from '../../../shared/lib/subscriptionApi';
import { initiateLifetimePayment, initiateSubscription, completeSubscription, cancelSubscription } from '../../../shared/lib/billingApi';

export default function BillingTab() {
  const location = useLocation();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubscription().then(s => { setSub(s); setLoading(false); });
  }, []);

  // Handle return from Flow.cl card registration
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('registration') === 'complete') {
      setActionLoading('completing');
      setMessage('Activating your subscription…');
      completeSubscription()
        .then(() => {
          setMessage('Subscription activated!');
          setError('');
          return fetchSubscription();
        })
        .then(s => { setSub(s); setActionLoading(''); })
        .catch(err => {
          setError(err.message);
          setMessage('');
          setActionLoading('');
        });
    }
  }, [location.search]);

  const handleUpgrade = async (type) => {
    setError('');
    setActionLoading(type);
    try {
      if (type === 'lifetime') {
        await initiateLifetimePayment();
      } else {
        await initiateSubscription();
      }
    } catch (err) {
      setError(err.message);
    }
    setActionLoading('');
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your monthly subscription?')) return;
    setError('');
    setActionLoading('cancel');
    try {
      await cancelSubscription();
      const s = await fetchSubscription();
      setSub(s);
    } catch (err) {
      setError(err.message);
    }
    setActionLoading('');
  };

  if (loading) return <div style={{ color: '#7a8e7a' }}>Loading billing…</div>;

  const plan = sub?.plan || 'free';
  const status = sub?.status || 'active';

  return (
    <div>
      {message && <div className="auth-success" style={{ marginBottom: 16 }}>{message}</div>}
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="billing-current">
        <div className="billing-plan-name">{plan} plan</div>
        <div className="billing-plan-status">
          Status: {status}
          {plan === 'monthly' && sub?.current_period_end && (
            <> &middot; Next billing: {new Date(sub.current_period_end).toLocaleDateString()}</>
          )}
          {plan === 'lifetime' && <> &middot; No recurring charges</>}
        </div>
        {plan === 'monthly' && status === 'active' && (
          <button
            className="console-btn console-btn-ghost"
            style={{ marginTop: 12 }}
            onClick={handleCancel}
            disabled={actionLoading === 'cancel'}
          >
            {actionLoading === 'cancel' ? 'Cancelling…' : 'Cancel subscription'}
          </button>
        )}
      </div>

      {plan === 'free' && (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Upgrade</h3>
          <div className="billing-cards">
            <div className="billing-card">
              <div className="billing-card-price">$2,000 CLP</div>
              <div className="billing-card-period">per month</div>
              <ul className="billing-card-features">
                <li>Unlimited cloud projects</li>
                <li>Auto-save to cloud</li>
                <li>Cancel anytime</li>
              </ul>
              <button
                className="console-btn console-btn-primary"
                onClick={() => handleUpgrade('monthly')}
                disabled={!!actionLoading}
                style={{ width: '100%' }}
              >
                {actionLoading === 'monthly' ? 'Redirecting…' : 'Subscribe monthly'}
              </button>
            </div>

            <div className="billing-card">
              <div className="billing-card-price">$100,000 CLP</div>
              <div className="billing-card-period">one-time payment</div>
              <div style={{ fontSize: 11, color: '#c8e600', fontWeight: 600, margin: '6px 0 4px', letterSpacing: '0.02em' }}>Limited-time offer</div>
              <ul className="billing-card-features">
                <li>Unlimited cloud projects</li>
                <li>Auto-save to cloud</li>
                <li>Lifetime access</li>
              </ul>
              <button
                className="console-btn console-btn-primary"
                onClick={() => handleUpgrade('lifetime')}
                disabled={!!actionLoading}
                style={{ width: '100%' }}
              >
                {actionLoading === 'lifetime' ? 'Redirecting…' : 'Buy lifetime'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
