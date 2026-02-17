import { supabase } from './supabase';

export async function fetchSubscription() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

export function canCreateProject(subscription, projectCount) {
  if (!subscription) return projectCount < 1;
  if (subscription.plan === 'free') return projectCount < 1;
  return true; // monthly or lifetime → unlimited
}
