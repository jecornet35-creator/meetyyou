import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Cache the list in memory for the duration of the function instance
let disposableDomainsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getDisposableDomains() {
  const now = Date.now();
  if (disposableDomainsCache && (now - cacheTimestamp) < CACHE_TTL) {
    return disposableDomainsCache;
  }

  const response = await fetch(
    'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf'
  );
  const text = await response.text();
  const domains = new Set(
    text.split('\n')
      .map(line => line.trim().toLowerCase())
      .filter(line => line && !line.startsWith('#'))
  );

  disposableDomainsCache = domains;
  cacheTimestamp = now;
  return domains;
}

Deno.serve(async (req) => {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return Response.json({ isDisposable: false, error: 'Email requis' }, { status: 400 });
    }

    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) {
      return Response.json({ isDisposable: false });
    }

    const disposableDomains = await getDisposableDomains();
    const isDisposable = disposableDomains.has(domain);

    return Response.json({ isDisposable, domain });
  } catch (error) {
    // En cas d'erreur (réseau, etc.), on laisse passer pour ne pas bloquer l'inscription
    return Response.json({ isDisposable: false, error: error.message });
  }
});
