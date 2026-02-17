import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { flowPost } from '../_shared/flow.ts';

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

    // Check existing subscription
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('flow_customer_id, flow_subscription_id, status')
      .eq('user_id', user.id)
      .single();

    if (sub?.flow_subscription_id && sub.status !== 'cancelled') {
      throw new Error('You already have an active subscription.');
    }

    let customerId = sub?.flow_customer_id;

    if (!customerId) {
      // Create Flow.cl customer
      const customer = await flowPost('/customer/create', {
        name: user.email!,
        email: user.email!,
        externalId: user.id,
      });
      if (!customer.customerId) {
        throw new Error(customer.message || 'Failed to create Flow customer');
      }
      customerId = customer.customerId;

      await supabaseAdmin.from('subscriptions').update({
        flow_customer_id: customerId,
      }).eq('user_id', user.id);
    }

    // Charge first month upfront (2,000 CLP) → redirect to Flow.cl
    // Webhook creates the subscription after payment is confirmed
    const commerceOrder = `KITA-SUB-${Date.now()}`;
    const result = await flowPost('/payment/create', {
      commerceOrder,
      subject: 'kit-a Monthly Plan',
      amount: '2000',
      currency: 'CLP',
      email: user.email!,
      urlConfirmation: `${Deno.env.get('SUPABASE_URL')}/functions/v1/flow-webhook`,
      urlReturn: 'https://kit-a.com/#/console/billing',
    });

    if (!result.url || !result.token) {
      throw new Error(result.message || 'Failed to create payment');
    }

    // Log the payment
    await supabaseAdmin.from('flow_payments').insert({
      user_id: user.id,
      flow_order: result.flowOrder || null,
      flow_token: result.token,
      amount: 2000,
      currency: 'CLP',
      payment_type: 'monthly',
      status: 1,
      raw_response: result,
    });

    return new Response(
      JSON.stringify({ url: result.url, token: result.token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
