import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { flowGet, flowPost } from '../_shared/flow.ts';

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

    // If paid (status 2), process based on payment type
    if (payment.status === 2) {
      if (paymentRow.payment_type === 'lifetime') {
        // Cancel existing monthly subscription on Flow.cl if any
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('flow_subscription_id')
          .eq('user_id', paymentRow.user_id)
          .single();

        if (existingSub?.flow_subscription_id) {
          try {
            await flowPost('/subscription/cancel', {
              subscriptionId: existingSub.flow_subscription_id,
            });
          } catch (e) {
            console.error('Failed to cancel Flow subscription:', e);
          }
        }

        await supabaseAdmin.from('subscriptions').update({
          plan: 'lifetime',
          status: 'active',
          flow_subscription_id: null,
          trial_end: null,
        }).eq('user_id', paymentRow.user_id);

      } else if (paymentRow.payment_type === 'monthly') {
        // First month paid upfront → create Flow subscription + activate
        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('flow_customer_id')
          .eq('user_id', paymentRow.user_id)
          .single();

        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        let flowSubId = null;
        let trialEnd = null;

        // Create Flow.cl subscription so future invoices are managed there
        if (sub?.flow_customer_id) {
          try {
            const planId = Deno.env.get('FLOW_MONTHLY_PLAN_ID')!;
            const today = now.toISOString().split('T')[0];

            const subscription = await flowPost('/subscription/create', {
              planId,
              customerId: sub.flow_customer_id,
              subscription_start: today,
            });

            if (subscription.subscriptionId) {
              flowSubId = subscription.subscriptionId;
              trialEnd = subscription.trial_end || null;
              // Use Flow's period dates if available
              if (subscription.period_end) {
                periodEnd.setTime(new Date(subscription.period_end).getTime());
              }
            }
          } catch (e) {
            console.error('Failed to create Flow subscription:', e);
          }
        }

        await supabaseAdmin.from('subscriptions').update({
          plan: 'monthly',
          status: 'active',
          flow_subscription_id: flowSubId,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          trial_end: trialEnd,
        }).eq('user_id', paymentRow.user_id);
      }
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response('Error', { status: 500 });
  }
});
