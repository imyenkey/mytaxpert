# Cloudflare Pages + Workers + KV Setup Guide

This document walks you through deploying your MyTaxPert blog to Cloudflare Pages with a persistent KV backend.

---

## Prerequisites

- Cloudflare account (free tier is fine)
- Git repository (or create one: `git init`)
- Node.js + npm (for wrangler CLI)
- Your GitHub repo linked to Cloudflare Pages (or use Cloudflare's git integration)

---

## Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

Verify:
```bash
wrangler --version
```

---

## Step 2: Authenticate Wrangler

```bash
wrangler login
```

This opens your browser. Sign in to Cloudflare and authorize wrangler.

---

## Step 3: Create KV Namespaces

### Production Namespace
```bash
wrangler kv:namespace create "BLOG_KV"
```

**Copy the output ID**, e.g.:
```
✓ Created namespace with id: abcd1234-5678-efgh-ijkl-mnopqrstuvwx
```

### Preview Namespace (for local testing)
```bash
wrangler kv:namespace create "BLOG_KV" --preview
```

**Copy the preview ID**, e.g.:
```
✓ Created namespace with id: efgh5678-9abc-ijkl-mnop-qrstuvwxyzab
```

---

## Step 4: Update wrangler.toml

Open `wrangler.toml` and replace the placeholder IDs:

```toml
[[kv_namespaces]]
binding = "BLOG_KV"
id = "YOUR_PROD_ID_HERE"
preview_id = "YOUR_PREVIEW_ID_HERE"
```

Example:
```toml
[[kv_namespaces]]
binding = "BLOG_KV"
id = "abcd1234-5678-efgh-ijkl-mnopqrstuvwx"
preview_id = "efgh5678-9abc-ijkl-mnop-qrstuvwxyzab"
```

---

## Step 5: Test Locally with wrangler pages dev

```bash
wrangler pages dev . --kv BLOG_KV
```

This starts a local dev server at `http://localhost:8788` with:
- Static files served from `.`
- Functions from `functions/`
- Local KV emulator

Visit:
- `http://localhost:8788/blog.html` — blog list (empty, no posts seeded yet)
- `http://localhost:8788/admin.html` — admin panel

---

## Step 6: Seed Initial Posts to KV

See [SEED_POSTS.md](./SEED_POSTS.md) for the full seed commands.

Quick version:
```bash
wrangler kv:key put --binding=BLOG_KV "posts:index" "[1,2,3]"
wrangler kv:key put --binding=BLOG_KV "post:1" '{"id":1,"title":"ITR Filing...","date":"2026-04-01","author":"Sivakumar Chandrasekar","category":"Income Tax","emoji":"📊","excerpt":"...","content":"...","status":"published","createdAt":1743638400000}'
# ... repeat for posts 2 and 3 (see SEED_POSTS.md)
```

After seeding, refresh `localhost:8788/blog.html` — you should see 3 blog cards.

---

## Step 7: Test Admin Panel (Locally)

1. Visit `http://localhost:8788/admin.html`
2. **Password**: Since we're testing locally, you need to set `ADMIN_PASSWORD` env var.

For local dev, either:

**Option A: Export in terminal**
```bash
export ADMIN_PASSWORD="my-secret-password"
wrangler pages dev . --kv BLOG_KV
```

**Option B: Create `.env.local` (git-ignored)**
```bash
# .env.local (add to .gitignore)
ADMIN_PASSWORD=my-secret-password
```

Then `wrangler pages dev` should pick it up automatically in newer versions.

3. Try logging in with the password you set
4. Create a new post
5. Visit `blog.html?id=<new-post-id>` to view it
6. Edit and delete the post
7. Verify all changes in KV

---

## Step 8: Deploy to Cloudflare Pages

### Option A: GitHub Integration (Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add Cloudflare Workers + KV backend"
   git push origin main
   ```

2. In Cloudflare Dashboard:
   - Go to **Pages** → **Connect to Git**
   - Select your repository
   - Set **Build command**: (leave empty, no build step)
   - Set **Build output directory**: `.` (or leave blank)
   - **Deploy**

3. Cloudflare automatically detects `wrangler.toml` and `functions/` — your Workers are deployed alongside Pages.

### Option B: Manual Deploy with Wrangler

```bash
wrangler pages deploy .
```

This uploads all files and deploys immediately.

---

## Step 9: Set the Admin Password Secret (Production)

```bash
wrangler pages secret put ADMIN_PASSWORD
```

When prompted, enter a strong password. This is stored encrypted in Cloudflare's vault — not in code.

---

## Step 10: Smoke Test Production

1. Visit your Cloudflare Pages URL (e.g., `https://mytaxpert.pages.dev`)
2. Go to `/blog.html` — verify the 3 seeded posts appear
3. Go to `/admin.html` — login with the password you set in Step 9
4. Create a new post and verify it appears on the blog list
5. Edit and delete the post
6. Check blog list updates in real-time

---

## Troubleshooting

### "Module not found" error on Functions
- Ensure your `functions/api/posts.js` and `functions/api/posts/[id].js` files exist
- The file path must match the URL structure: `functions/api/posts.js` → `/api/posts`

### KV returns null / posts not found
- Did you seed the initial posts? Run the commands in [SEED_POSTS.md](./SEED_POSTS.md)
- Check that `posts:index` exists: `wrangler kv:key list --binding=BLOG_KV | grep "posts:index"`

### 401 Unauthorized on admin endpoints
- Ensure `ADMIN_PASSWORD` secret is set: `wrangler pages secret list`
- Make sure the password you're sending in the `X-Admin-Password` header matches the secret

### Login fails but password is correct
- Check browser console for network errors
- Verify the `X-Admin-Password` header is being sent: open DevTools → Network tab → click login request

### Posts appear locally but not after deploy
- KV is regional. Newly created posts may take up to 60 seconds to propagate globally (eventual consistency)
- Try refreshing in a few seconds

---

## Environment Variables

### Local Development
Set `ADMIN_PASSWORD` via:
```bash
export ADMIN_PASSWORD="your-password"
wrangler pages dev .
```

### Production
Set via Cloudflare Dashboard:
```bash
wrangler pages secret put ADMIN_PASSWORD
```

Never hardcode the password in code.

---

## Git Ignore

Update `.gitignore`:
```
# Wrangler/local dev
node_modules/
.env
.env.local
dist/
```

---

## Architecture Summary

```
┌─────────────────┐
│  Static Files   │  (blog.html, admin.html, styles.css, etc.)
│ (Pages Service) │
└────────┬────────┘
         │
         └──→ /api/posts       (GET published, POST create)
         │    └──→ functions/api/posts.js
         │
         └──→ /api/posts/:id   (GET, PUT, DELETE)
         │    └──→ functions/api/posts/[id].js
         │
         └──→ /api/admin/ping  (auth check)
              └──→ functions/api/admin/ping.js

All backed by:
┌─────────────────┐
│  Cloudflare KV  │  (post:1, post:2, ..., posts:index)
│ (Persistent)    │
└─────────────────┘
```

---

## Next Steps

- Customize the admin password
- Add more blog posts via the admin panel
- Customize blog styling further (already done in the CSS update!)
- Set up a custom domain in Cloudflare DNS
- Monitor KV usage in Cloudflare Dashboard

---

## Support

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [KV Storage Docs](https://developers.cloudflare.com/kv/)
