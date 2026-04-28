/**
 * Cloudflare Pages Function: /api/admin/ping
 * Simple auth check endpoint for admin login verification
 */

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Admin-Password',
      },
    });
  }

  if (request.method === 'GET') {
    const provided = request.headers.get('X-Admin-Password');
    const expectedPassword = 'Mytaxpert@2026';

    // Log for debugging
    console.log('Auth attempt:', {
      provided,
      expected: expectedPassword,
      envPassword: env.ADMIN_PASSWORD,
      match: provided === expectedPassword,
    });

    // Direct password comparison (hardcoded for now)
    if (provided !== expectedPassword) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    return jsonResponse({ ok: true });
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}
