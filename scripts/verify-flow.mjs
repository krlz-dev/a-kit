#!/usr/bin/env node
/**
 * Verify Flow.cl setup: checks plans, customers, and subscription readiness.
 *
 * Usage:
 *   FLOW_API_KEY=xxx FLOW_SECRET_KEY=yyy FLOW_MONTHLY_PLAN_ID=zzz node scripts/verify-flow.mjs
 */

import { createHmac } from 'crypto';

const API_URL = 'https://www.flow.cl/api';
const API_KEY = process.env.FLOW_API_KEY;
const SECRET_KEY = process.env.FLOW_SECRET_KEY;
const PLAN_ID = process.env.FLOW_MONTHLY_PLAN_ID;

if (!API_KEY || !SECRET_KEY) {
  console.error('Missing FLOW_API_KEY or FLOW_SECRET_KEY env vars');
  process.exit(1);
}

function sign(params) {
  const sorted = Object.keys(params).sort();
  const toSign = sorted.map(k => k + params[k]).join('');
  return createHmac('sha256', SECRET_KEY).update(toSign).digest('hex');
}

async function flowGet(endpoint, params = {}) {
  const all = { ...params, apiKey: API_KEY };
  all.s = sign(all);
  const qs = new URLSearchParams(all).toString();
  const url = `${API_URL}${endpoint}?${qs}`;
  const res = await fetch(url);
  const data = await res.json();
  return { status: res.status, data };
}

console.log('\n=== Flow.cl Verification ===\n');
console.log(`API URL: ${API_URL}`);
console.log(`API Key: ${API_KEY.slice(0, 8)}...`);

// 1. List all plans
console.log('\n--- Plans ---');
const plans = await flowGet('/plans/list', { start: '0', limit: '50' });
if (plans.data.data && plans.data.data.length > 0) {
  console.log(`Found ${plans.data.total} plan(s):`);
  for (const p of plans.data.data) {
    console.log(`  [${p.status === 1 ? 'ACTIVE' : 'INACTIVE'}] planId="${p.planId}" name="${p.name}" $${p.amount} ${p.currency} interval=${p.interval} (1=daily,2=weekly,3=monthly,4=yearly)`);
  }
} else {
  console.log('NO PLANS FOUND! You need to create a monthly plan first.');
  console.log('Response:', JSON.stringify(plans.data, null, 2));
}

// 2. Check specific plan
if (PLAN_ID) {
  console.log(`\n--- Checking FLOW_MONTHLY_PLAN_ID="${PLAN_ID}" ---`);
  const plan = await flowGet('/plans/get', { planId: PLAN_ID });
  if (plan.data.planId) {
    console.log(`PLAN EXISTS: "${plan.data.name}" $${plan.data.amount} ${plan.data.currency}`);
    console.log(`  interval: ${plan.data.interval} (should be 3 for monthly)`);
    console.log(`  status: ${plan.data.status} (should be 1 for active)`);
    if (plan.data.interval !== 3) console.warn('  WARNING: interval is not 3 (monthly)!');
    if (plan.data.status !== 1) console.warn('  WARNING: plan is not active!');
  } else {
    console.error(`PLAN NOT FOUND! Response:`, JSON.stringify(plan.data, null, 2));
  }
} else {
  console.log('\n--- No FLOW_MONTHLY_PLAN_ID set, skipping plan check ---');
  console.log('Set this env var to verify your specific plan.');
}

// 3. List customers
console.log('\n--- Customers ---');
const customers = await flowGet('/customer/list', { start: '0', limit: '10' });
if (customers.data.data && customers.data.data.length > 0) {
  console.log(`Found ${customers.data.total} customer(s) (showing first 10):`);
  for (const c of customers.data.data) {
    const card = c.creditCardType ? `${c.creditCardType} ...${c.last4CardDigits}` : 'NO CARD';
    console.log(`  [${c.status === '1' ? 'ACTIVE' : 'INACTIVE'}] id="${c.customerId}" email="${c.email}" card=${card}`);
  }
} else {
  console.log('No customers found (this is normal if no one has subscribed yet).');
  if (customers.status !== 200) console.log('Response:', JSON.stringify(customers.data, null, 2));
}

console.log('\n=== Done ===\n');
