import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { flowGet } from '../_shared/flow.ts';

serve(async (req) => {
  try {
    // Flow.cl sends token via POST body (form-encoded)
    const body = await req.formData().catch(() => null);
    const token = body?.get('token') as string || new URL(req.url).searchParams.get('token');

    if (!token) {
      return new Response('Missing token', { status: 400 });
    }

    // Verify payment status with Flow.cl
    const payment = await flowGet('/payment/getStatus', { token });

    // Update flow_payments record
    const { data: paymentRows } = await supabaseAdmin
      .from('flow_payments')
      .select('*')
      .eq('flow_token', token)
      .limit(1);

    const paymentRow = paymentRows?.[0];
    if (!paymentRow) {
      return new Response('Payment not found', { status: 404 });
    }

    await supabaseAdmin.from('flow_payments').update({
      status: payment.status,
      flow_order: payment.flowOrder || paymentRow.flow_order,
      raw_response: payment,
    }).eq('id', paymentRow.id);

    // If paid (status 2), update subscription
    if (payment.status === 2) {
      if (paymentRow.payment_type === 'lifetime') {
        await supabaseAdmin.from('subscriptions').update({
          plan: 'lifetime',
          status: 'active',
        }).eq('user_id', paymentRow.user_id);
      } else if (paymentRow.payment_type === 'monthly') {
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await supabaseAdmin.from('subscriptions').update({
          plan: 'monthly',
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        }).eq('user_id', paymentRow.user_id);
      }
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response('Error', { status: 500 });
  }
});
