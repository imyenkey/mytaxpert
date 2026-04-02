# Quick Start: Cloudflare Pages + KV Blog

## 60-Second Setup

### 1. Install & Auth (2 min)
```bash
npm install -g wrangler
wrangler login
```

### 2. Create KV Namespaces (1 min)
```bash
wrangler kv:namespace create "BLOG_KV"
# Copy the ID printed (prod ID)

wrangler kv:namespace create "BLOG_KV" --preview
# Copy the preview ID
```

### 3. Update wrangler.toml (1 min)
Open `wrangler.toml` and paste the IDs:
```toml
[[kv_namespaces]]
binding = "BLOG_KV"
id = "YOUR_PROD_ID"
preview_id = "YOUR_PREVIEW_ID"
```

### 4. Test Locally (2 min)
```bash
export ADMIN_PASSWORD="admin-test-password"
wrangler pages dev . --kv BLOG_KV
```

Visit:
- `http://localhost:8788/blog.html`
- `http://localhost:8788/admin.html`

### 5. Seed Posts (2 min)
Copy-paste the seed commands from `SEED_POSTS.md` into terminal. This adds the 3 blog posts to KV.

### 6. Test Admin (1 min)
- Visit `http://localhost:8788/admin.html`
- Login with `admin-test-password`
- Create a post → verify it appears on blog list

### 7. Deploy (2 min)
**Option A: GitHub Integration**
```bash
git add .
git commit -m "Add Cloudflare Workers + KV"
git push origin main
# Cloudflare auto-deploys via Pages settings
```

**Option B: Direct Deploy**
```bash
wrangler pages deploy .
```

### 8. Set Production Password (1 min)
```bash
wrangler pages secret put ADMIN_PASSWORD
# Enter a strong password when prompted
```

### 9. Test Production (1 min)
Visit your Cloudflare Pages URL:
- `/blog.html` — see the 3 seeded posts
- `/admin.html` — login with your production password
- Create a post and verify it appears

---

## That's it! 🎉

Your blog is now live on Cloudflare Pages with persistent global data.

---

## Common Commands

```bash
# Local dev
export ADMIN_PASSWORD="test"; wrangler pages dev . --kv BLOG_KV

# Seed posts
# (see SEED_POSTS.md)

# Deploy
git push origin main
# OR
wrangler pages deploy .

# Set/update secret
wrangler pages secret put ADMIN_PASSWORD

# List KV keys
wrangler kv:key list --binding=BLOG_KV

# View KV value
wrangler kv:key get --binding=BLOG_KV "post:1"

# Delete KV key (if needed)
wrangler kv:key delete --binding=BLOG_KV "post:1"
```

---

## Files to Review

1. **CLOUDFLARE_SETUP.md** — Detailed deployment guide
2. **SEED_POSTS.md** — Exact seed commands
3. **IMPLEMENTATION_SUMMARY.md** — Technical overview
4. **functions/api/posts.js** — API logic
5. **functions/api/posts/[id].js** — Post detail API
6. **blog.js** — Frontend (now uses fetch API)
7. **admin.js** — Admin panel (now uses fetch API)

---

## Troubleshooting

**Posts not showing?**
→ Did you run the seed commands from SEED_POSTS.md?

**Login fails?**
→ Check that `ADMIN_PASSWORD` env var matches what you're sending

**Deployment fails?**
→ Check `wrangler.toml` has correct KV IDs

**Still stuck?**
→ See full troubleshooting in CLOUDFLARE_SETUP.md

---

## What's Different from localStorage

| Feature | Before (localStorage) | After (KV) |
|---------|---|---|
| Data persistence | Per-browser, temporary | Global, permanent |
| Shared across devices | ❌ No | ✅ Yes |
| Production ready | ❌ No | ✅ Yes |
| Scaling | Limited | Unlimited |
| Requires backend | ❌ No | ✅ Yes (Cloudflare) |
| Admin password | Hardcoded, visible | Secret, encrypted |
| Cost | Free | Free tier (millions of reads) |

---

## Blog Features Now Available

✅ Create, read, update, delete posts  
✅ Public blog listing (published posts only)  
✅ Admin panel (draft/published control)  
✅ Shareable post URLs (`blog.html?id=123`)  
✅ Dark theme (navy + electric gold)  
✅ Search by title/category/author  
✅ Responsive design  
✅ Global CDN (Cloudflare)  

---

## Next: Customize & Scale

- Add more posts via admin panel
- Customize blog styling (already dark-themed!)
- Set up a custom domain
- Monitor KV usage in Cloudflare Dashboard
- Add categories, tags, or filters
- Set up email notifications on new posts

---

**Ready to deploy? Start with CLOUDFLARE_SETUP.md →**
