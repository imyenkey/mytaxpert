/**
 * Cloudflare Pages Function: /api/posts
 * Handles GET (list posts) and POST (create post)
 */

function checkAuth(request) {
  const provided = request.headers.get('X-Admin-Password');
  const expectedPassword = 'Mytaxpert@2026';
  return provided === expectedPassword;
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleGet(request, env) {
  const hasAuth = checkAuth(request, env);

  try {
    // Fetch the index of post IDs
    const indexRaw = await env.BLOG_KV.get('posts:index');
    const index = indexRaw ? JSON.parse(indexRaw) : [];

    if (index.length === 0) {
      return jsonResponse({ posts: [] });
    }

    // Fetch all posts in parallel
    const postPromises = index.map(id =>
      env.BLOG_KV.get(`post:${id}`, 'json').catch(() => null)
    );
    const posts = await Promise.all(postPromises);

    // Filter out null values (deleted posts)
    const validPosts = posts.filter(p => p !== null);

    // If not authenticated, filter to published only
    const filtered = hasAuth
      ? validPosts
      : validPosts.filter(p => p.status === 'published');

    return jsonResponse({ posts: filtered });
  } catch (err) {
    console.error('Error in GET /api/posts:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

async function handlePost(request, env) {
  // Check authentication
  if (!checkAuth(request)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await request.json();

    // Validate required fields
    const required = ['title', 'category', 'author', 'emoji', 'excerpt', 'content', 'date', 'status'];
    for (const field of required) {
      if (!body[field]) {
        return jsonResponse({ error: `Missing required field: ${field}` }, 400);
      }
    }

    // Generate numeric ID using timestamp
    const id = Date.now();

    // Create post object
    const post = {
      id,
      title: body.title,
      category: body.category,
      author: body.author,
      emoji: body.emoji,
      excerpt: body.excerpt,
      content: body.content,
      date: body.date,
      status: body.status,
      createdAt: Date.now(),
    };

    // Write post to KV
    await env.BLOG_KV.put(`post:${id}`, JSON.stringify(post));

    // Update index: fetch, unshift new ID, write back
    const indexRaw = await env.BLOG_KV.get('posts:index');
    const index = indexRaw ? JSON.parse(indexRaw) : [];
    index.unshift(id);
    await env.BLOG_KV.put('posts:index', JSON.stringify(index));

    return jsonResponse({ post }, 201);
  } catch (err) {
    console.error('Error in POST /api/posts:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export default async function handler(request, env) {
  // Enable CORS if needed (already same-origin, but good to be explicit)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
      },
    });
  }

  if (request.method === 'GET') {
    return handleGet(request, env);
  }

  if (request.method === 'POST') {
    return handlePost(request, env);
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}
