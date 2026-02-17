-- Add 'verification' to flow_payments payment_type
alter table public.flow_payments
  drop constraint flow_payments_payment_type_check,
  add constraint flow_payments_payment_type_check
    check (payment_type in ('monthly', 'lifetime', 'verification'));
