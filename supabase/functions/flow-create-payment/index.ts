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

    // Create one-time payment for lifetime plan (100,000 CLP)
    const commerceOrder = `KITA-LT-${Date.now()}`;
    const result = await flowPost('/payment/create', {
      commerceOrder,
      subject: 'kit-a Lifetime Plan',
      amount: '100000',
      currency: 'CLP',
      email: user.email!,
      urlConfirmation: `${Deno.env.get('SUPABASE_URL')}/functions/v1/flow-webhook`,
      urlReturn: 'https://kit-a.com/#/console/billing',
    });

    // Log payment
    await supabaseAdmin.from('flow_payments').insert({
      user_id: user.id,
      flow_order: result.flowOrder || null,
      flow_token: result.token,
      amount: 100000,
      currency: 'CLP',
      payment_type: 'lifetime',
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
