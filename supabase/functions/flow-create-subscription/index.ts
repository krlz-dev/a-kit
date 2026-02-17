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

    // Check if we already have a Flow customer for this user
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('flow_customer_id')
      .eq('user_id', user.id)
      .single();

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

      // Save customer ID
      await supabaseAdmin.from('subscriptions').update({
        flow_customer_id: customerId,
      }).eq('user_id', user.id);
    }

    // Send customer to register their credit card
    // After registration, user returns to billing page with token
    const result = await flowPost('/customer/register', {
      customerId,
      url_return: 'https://kit-a.com/#/console/billing?registration=complete',
    });

    if (!result.url || !result.token) {
      throw new Error(result.message || 'Failed to start card registration');
    }

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
