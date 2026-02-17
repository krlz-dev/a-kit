import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { flowPost, flowGet } from '../_shared/flow.ts';

serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    // Verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    // Get the user's subscription record with flow_customer_id
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!sub?.flow_customer_id) {
      throw new Error('No Flow customer found. Please start the subscription process again.');
    }

    // Verify the customer has a registered card by fetching customer details
    const customer = await flowGet('/customer/get', {
      customerId: sub.flow_customer_id,
    });

    if (!customer.creditCardType) {
      throw new Error('Card registration not completed. Please register your card first.');
    }

    // Create the subscription
    const planId = Deno.env.get('FLOW_MONTHLY_PLAN_ID')!;
    const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

    const subscription = await flowPost('/subscription/create', {
      planId,
      customerId: sub.flow_customer_id,
      subscription_start: today,
    });

    // Calculate period dates
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Update subscription record
    await supabaseAdmin.from('subscriptions').update({
      plan: 'monthly',
      status: 'active',
      flow_subscription_id: subscription.subscriptionId,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    }).eq('user_id', user.id);

    // Log payment
    await supabaseAdmin.from('flow_payments').insert({
      user_id: user.id,
      amount: 2000,
      currency: 'CLP',
      payment_type: 'monthly',
      status: 2, // considered active once subscription is created
      raw_response: subscription,
    });

    return new Response(
      JSON.stringify({ success: true, subscriptionId: subscription.subscriptionId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
