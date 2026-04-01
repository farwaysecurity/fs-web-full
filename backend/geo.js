// Geo lookup using free ip-api.com (no key needed, 45 req/min limit)
// Returns { country, countryCode, city, region, lat, lon, isp } or nulls

const cache = new Map(); // simple in-memory cache

async function geoLookup(ip) {
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168') || ip.startsWith('10.')) {
    return { country: 'Local', country_code: 'LO', city: 'Localhost', region: '', latitude: null, longitude: null, isp: 'Local' };
  }

  if (cache.has(ip)) return cache.get(ip);

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon,isp`);
    const data = await res.json();
    if (data.status === 'success') {
      const geo = {
        country: data.country || null,
        country_code: data.countryCode || null,
        city: data.city || null,
        region: data.regionName || null,
        latitude: data.lat || null,
        longitude: data.lon || null,
        isp: data.isp || null,
      };
      cache.set(ip, geo);
      // expire cache after 1 hour
      setTimeout(() => cache.delete(ip), 3600000);
      return geo;
    }
  } catch (e) {
    // silently fail — geo is non-critical
  }
  return { country: null, country_code: null, city: null, region: null, latitude: null, longitude: null, isp: null };
}

module.exports = { geoLookup };
