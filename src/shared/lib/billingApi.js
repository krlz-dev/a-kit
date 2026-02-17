import { supabase } from './supabase';

async function callEdgeFunction(name, body = {}) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    // Extract the actual error message from the edge function response
    let msg = 'Request failed';
    try {
      const json = await error.context.json();
      msg = json.error || error.message || msg;
    } catch { msg = error.message || msg; }
    throw new Error(msg);
  }
  return data;
}

// Lifetime: one-time payment → redirect to Flow.cl checkout
export async function initiateLifetimePayment() {
  const { url, token } = await callEdgeFunction('flow-create-payment');
  if (!url) throw new Error('Payment service unavailable. Please try again.');
  window.location.href = `${url}?token=${token}`;
}

// Monthly: 50 CLP verification payment → redirect to Flow.cl
// After payment, webhook creates subscription + refunds the 50 CLP
export async function initiateSubscription() {
  const { url, token } = await callEdgeFunction('flow-create-subscription');
  if (!url) throw new Error('Subscription service unavailable. Please try again.');
  window.location.href = `${url}?token=${token}`;
}

export async function cancelSubscription() {
  return callEdgeFunction('flow-cancel-subscription');
}
