import { supabase } from './supabase';

async function callEdgeFunction(name, body = {}) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw new Error(error.message || 'Request failed');
  return data;
}

// Lifetime: one-time payment → redirect to Flow.cl checkout
export async function initiateLifetimePayment() {
  const { url, token } = await callEdgeFunction('flow-create-payment');
  if (!url) throw new Error('Payment service unavailable. Please try again.');
  window.location.href = `${url}?token=${token}`;
}

// Monthly Step 1: create customer + redirect to card registration on Flow.cl
export async function initiateSubscription() {
  const { url, token } = await callEdgeFunction('flow-create-subscription');
  if (!url) throw new Error('Subscription service unavailable. Please try again.');
  window.location.href = `${url}?token=${token}`;
}

// Monthly Step 2: after card registration, create the actual subscription
export async function completeSubscription() {
  return callEdgeFunction('flow-complete-subscription');
}

export async function cancelSubscription() {
  return callEdgeFunction('flow-cancel-subscription');
}
