const CACHE_KEY = 'kit_currency_info';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCached() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function setCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* ignore quota errors */ }
}

export async function getUserCurrencyInfo() {
  const cached = getCached();
  if (cached) return cached;

  try {
    const [geoRes, rateRes] = await Promise.all([
      fetch('https://ipapi.co/json/'),
      fetch('https://open.er-api.com/v6/latest/CLP'),
    ]);

    if (!geoRes.ok || !rateRes.ok) return null;

    const geo = await geoRes.json();
    const rates = await rateRes.json();

    if (!geo.currency || !rates.rates?.[geo.currency]) return null;

    const info = {
      currency: geo.currency,
      rate: rates.rates[geo.currency],
      country: geo.country_code,
    };

    setCache(info);
    return info;
  } catch {
    return null;
  }
}

export function formatLocalPrice(amountCLP, currencyInfo) {
  if (!currencyInfo || currencyInfo.currency === 'CLP') return null;

  try {
    const converted = amountCLP * currencyInfo.rate;
    const formatted = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currencyInfo.currency,
      maximumFractionDigits: converted < 10 ? 2 : 0,
    }).format(converted);

    return `≈ ${formatted} ${currencyInfo.currency}`;
  } catch {
    return null;
  }
}
