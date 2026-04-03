/**
 * Cloudflare Pages Function: /api/admin/ping
 * Simple auth check endpoint for admin login verification
 */

function checkAuth(request, env) {
  const provided = request.headers.get('X-Admin-Password');
  return provided === env.ADMIN_PASSWORD;
}

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
    const stored = env.ADMIN_PASSWORD;

    // Debug logging
    console.log('Auth check:', { provided, stored, match: provided === stored });

    if (!checkAuth(request, env)) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    return jsonResponse({ ok: true });
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}
