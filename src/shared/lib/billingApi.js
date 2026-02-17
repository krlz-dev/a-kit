import { supabase } from './supabase';

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';

async function callEdgeFunction(name, body = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// Lifetime: one-time payment → redirect to Flow.cl checkout
export async function initiateLifetimePayment() {
  const { url, token } = await callEdgeFunction('flow-create-payment');
  if (url) window.location.href = `${url}?token=${token}`;
}

// Monthly Step 1: create customer + redirect to card registration on Flow.cl
export async function initiateSubscription() {
  const { url, token } = await callEdgeFunction('flow-create-subscription');
  if (url) window.location.href = `${url}?token=${token}`;
}

// Monthly Step 2: after card registration, create the actual subscription
export async function completeSubscription() {
  return callEdgeFunction('flow-complete-subscription');
}

export async function cancelSubscription() {
  return callEdgeFunction('flow-cancel-subscription');
}
