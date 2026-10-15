// Vercel supplies these headers from the visitor's public IP address.
export default {
  fetch(request) {
    const country = request.headers.get('x-vercel-ip-country');
    const region = request.headers.get('x-vercel-ip-country-region');
    return Response.json({
      country: /^[A-Z]{2}$/.test(country || '') ? country : null,
      region: /^[A-Z0-9]{1,3}$/.test(region || '') ? region : null,
    }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  },
};
