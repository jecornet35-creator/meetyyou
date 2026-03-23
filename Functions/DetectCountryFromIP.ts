import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get IP from request headers
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                req.headers.get('x-real-ip') ||
                '8.8.8.8';

    // Skip private/loopback IPs
    if (ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.') || ip === '::1') {
      return Response.json({ country: null, country_code: null, message: 'Private IP, cannot geolocate' });
    }

    // Use ip-api.com (free, no key required)
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`);
    const geoData = await geoRes.json();

    if (geoData.status !== 'success') {
      return Response.json({ country: null, country_code: null, message: 'Geolocation failed' });
    }

    // Update profile only if country is empty
    const profiles = await base44.entities.Profile.filter({ created_by: user.email });
    const profile = profiles[0];

    if (profile && !profile.country) {
      await base44.entities.Profile.update(profile.id, { country: geoData.country });
    }

    return Response.json({
      country: geoData.country,
      country_code: geoData.countryCode,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
