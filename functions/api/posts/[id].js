/**
 * Cloudflare Pages Function: /api/posts/:id
 * Handles GET (single post), PUT (update), and DELETE
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

async function handleGet(id, env) {
  try {
    const post = await env.BLOG_KV.get(`post:${id}`, 'json');
    if (!post) {
      return jsonResponse({ error: 'Post not found' }, 404);
    }
    return jsonResponse({ post });
  } catch (err) {
    console.error(`Error in GET /api/posts/${id}:`, err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

async function handlePut(id, request, env) {
  // Check authentication
  if (!checkAuth(request, env)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    // Fetch existing post
    const existingPost = await env.BLOG_KV.get(`post:${id}`, 'json');
    if (!existingPost) {
      return jsonResponse({ error: 'Post not found' }, 404);
    }

    // Parse incoming data
    const updates = await request.json();

    // Merge updates (partial update allowed)
    const updatedPost = { ...existingPost, ...updates };

    // Write back to KV
    await env.BLOG_KV.put(`post:${id}`, JSON.stringify(updatedPost));

    return jsonResponse({ post: updatedPost });
  } catch (err) {
    console.error(`Error in PUT /api/posts/${id}:`, err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

async function handleDelete(id, request, env) {
  // Check authentication
  if (!checkAuth(request, env)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    // Delete the post
    await env.BLOG_KV.delete(`post:${id}`);

    // Remove from index
    const indexRaw = await env.BLOG_KV.get('posts:index');
    const index = indexRaw ? JSON.parse(indexRaw) : [];
    const filteredIndex = index.filter(postId => postId !== parseInt(id, 10));
    await env.BLOG_KV.put('posts:index', JSON.stringify(filteredIndex));

    return jsonResponse({ success: true });
  } catch (err) {
    console.error(`Error in DELETE /api/posts/${id}:`, err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export default async function handler(request, env, params) {
  const id = params.id;

  // Enable CORS if needed (already same-origin, but good to be explicit)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
      },
    });
  }

  if (request.method === 'GET') {
    return handleGet(id, env);
  }

  if (request.method === 'PUT') {
    return handlePut(id, request, env);
  }

  if (request.method === 'DELETE') {
    return handleDelete(id, request, env);
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}
