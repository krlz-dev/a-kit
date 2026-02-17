const encoder = new TextEncoder();

export function signParams(params: Record<string, string>, secretKey: string): string {
  const keys = Object.keys(params).sort();
  const toSign = keys.map(k => `${k}${params[k]}`).join('');

  const key = encoder.encode(secretKey);
  const data = encoder.encode(toSign);

  // Use Web Crypto API for HMAC-SHA256
  return crypto.subtle.importKey(
    'raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  ).then(async (cryptoKey) => {
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  });
}

export async function flowPost(endpoint: string, params: Record<string, string>): Promise<any> {
  const apiUrl = Deno.env.get('FLOW_API_URL')!;
  const apiKey = Deno.env.get('FLOW_API_KEY')!;
  const secretKey = Deno.env.get('FLOW_SECRET_KEY')!;

  const allParams = { ...params, apiKey };
  const s = await signParams(allParams, secretKey);
  allParams.s = s;

  const body = new URLSearchParams(allParams);
  const res = await fetch(`${apiUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  return res.json();
}

export async function flowGet(endpoint: string, params: Record<string, string>): Promise<any> {
  const apiUrl = Deno.env.get('FLOW_API_URL')!;
  const apiKey = Deno.env.get('FLOW_API_KEY')!;
  const secretKey = Deno.env.get('FLOW_SECRET_KEY')!;

  const allParams = { ...params, apiKey };
  const s = await signParams(allParams, secretKey);
  allParams.s = s;

  const qs = new URLSearchParams(allParams).toString();
  const res = await fetch(`${apiUrl}${endpoint}?${qs}`);

  return res.json();
}
