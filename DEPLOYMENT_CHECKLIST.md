# Deployment Checklist

Use this checklist to ensure everything is set up correctly before deploying to production.

---

## Pre-Deployment (Local)

### Code & Files
- [ ] `functions/api/posts.js` exists (GET list, POST create)
- [ ] `functions/api/posts/[id].js` exists (GET, PUT, DELETE)
- [ ] `functions/api/admin/ping.js` exists (auth check)
- [ ] `wrangler.toml` exists with correct structure
- [ ] `blog.js` updated to use async fetch API
- [ ] `admin.js` updated to use async fetch API
- [ ] All documentation files created (CLOUDFLARE_SETUP.md, SEED_POSTS.md, etc.)

### Environment Setup
- [ ] Node.js & npm installed
- [ ] Wrangler CLI installed: `npm install -g wrangler`
- [ ] Logged in to Cloudflare: `wrangler login`
- [ ] Cloudflare account has active Pages project

### KV Namespaces
- [ ] Production KV namespace created (`wrangler kv:namespace create "BLOG_KV"`)
- [ ] Preview KV namespace created (`wrangler kv:namespace create "BLOG_KV" --preview`)
- [ ] Both IDs copied to `wrangler.toml`

### Local Testing
- [ ] Set `ADMIN_PASSWORD` env var: `export ADMIN_PASSWORD="test-password"`
- [ ] Start local dev: `wrangler pages dev . --kv BLOG_KV`
- [ ] Blog list loads at `http://localhost:8788/blog.html`
- [ ] Admin panel loads at `http://localhost:8788/admin.html`
- [ ] **Before** seeding posts:
  - [ ] Admin login with test password works
  - [ ] Blog list shows "No Posts Yet"
  - [ ] Can create a post via admin panel
  - [ ] New post appears on blog list
  - [ ] Can edit and delete the post

### Post Seeding
- [ ] Reviewed `SEED_POSTS.md`
- [ ] Copied `posts:index` seed command and ran it
- [ ] Copied post 1, 2, 3 seed commands and ran them
- [ ] Verified posts appear on `blog.html` locally
- [ ] Verified admin panel shows all 3 posts (including drafts if any)

### Post-Seed Testing
- [ ] Direct URL works: `http://localhost:8788/blog.html?id=1` opens post 1
- [ ] Search filters posts by title/category/author
- [ ] Can create a NEW post and it appears in the list
- [ ] Can edit existing post and changes persist
- [ ] Can delete post and it's removed from list
- [ ] Wrong password shows error on admin login

---

## Git & Deployment Preparation

### Source Control
- [ ] `.gitignore` includes:
  - `node_modules/`
  - `.env`
  - `.env.local`
  - `dist/`
  - `wrangler-cache/` (if applicable)
- [ ] No secrets in code (password not hardcoded)
- [ ] All files staged and ready to commit
- [ ] Commit message written: `"Add Cloudflare Workers + KV blog backend"`

### Cloudflare Pages Integration
- [ ] GitHub repo linked to Cloudflare Pages (if using GitHub integration)
- [ ] Build settings configured:
  - **Build command**: (leave empty)
  - **Build output directory**: `.` or empty
  - **Root directory**: `.`
- [ ] `wrangler.toml` detected by Cloudflare (check Pages project settings)

---

## Production Deployment

### Deployment Method
- [ ] **GitHub Method**: `git push origin main` (auto-deploys via CI)
  - OR
- [ ] **Direct Method**: `wrangler pages deploy .`

### After Deployment
- [ ] Build succeeds (check Cloudflare Pages build log)
- [ ] Functions deployed (check Pages Functions status)
- [ ] No errors in deployment logs

### Production Secrets
- [ ] Set admin password: `wrangler pages secret put ADMIN_PASSWORD`
- [ ] Enter a **strong, unique password** (not "admin123" or "admin-test-password")
- [ ] Confirm secret is set: `wrangler pages secret list`

### Production Testing
- [ ] Visit Cloudflare Pages URL (e.g., `https://mytaxpert.pages.dev`)
- [ ] Blog list loads and shows 3 seeded posts
- [ ] Click post card → opens post detail
- [ ] Direct URL works: `?id=1` opens post 1
- [ ] Visit admin panel at `/admin.html`
- [ ] Login with **production password** (the one you set via `wrangler pages secret put`)
- [ ] Create a NEW post
- [ ] Refresh blog list → NEW post appears
- [ ] Edit the post → changes persist
- [ ] Delete the post → removed from list
- [ ] Logout and login again → session works

### Data & Performance
- [ ] KV keys are accessible:
  ```bash
  wrangler kv:key get --binding=BLOG_KV "posts:index"
  wrangler kv:key get --binding=BLOG_KV "post:1"
  ```
- [ ] All 3 seeded posts in KV
- [ ] Blog loads in < 2 seconds
- [ ] Admin panel loads in < 2 seconds
- [ ] No 404 or 500 errors in console

### Cross-Browser Testing
- [ ] Chrome/Chromium: blog loads, posts display, search works
- [ ] Firefox: same
- [ ] Safari: same
- [ ] Mobile browser: responsive layout works

### Accessibility
- [ ] Dark theme is readable on all screen sizes
- [ ] Blog cards are clickable (cursor changes to pointer)
- [ ] Links have focus states
- [ ] No console errors on page load

---

## Post-Deployment

### Documentation
- [ ] CLOUDFLARE_SETUP.md kept in repo for future reference
- [ ] SEED_POSTS.md kept in repo (backup for re-seeding if needed)
- [ ] IMPLEMENTATION_SUMMARY.md updated if any changes made
- [ ] QUICK_START.md is accurate for your setup

### Ongoing
- [ ] Share your blog URL with users
- [ ] Add it to your main website's footer/header
- [ ] Create regular blog posts via admin panel
- [ ] Monitor Cloudflare Dashboard for KV usage (free tier allows millions of reads)
- [ ] Backup important posts (optional: export via admin panel or KV API)

### Troubleshooting Prep
- [ ] Know how to check Cloudflare Pages logs: Dashboard → Pages → your project → Deployments
- [ ] Know how to check KV status: Dashboard → Workers & Pages → KV → BLOG_KV
- [ ] Know how to view secrets: `wrangler pages secret list`
- [ ] Have a recovery plan if posts are lost (re-seed from SEED_POSTS.md + manual entry)

---

## Final Verification Checklist

Before declaring success, verify all 3 of these:

### ✅ Public Blog Works
```
http://YOUR_SITE.pages.dev/blog.html
├── Shows 3 blog posts (or your custom posts)
├── Click card → opens post detail
├── blog.html?id=1 → opens post 1 directly
├── Search filters posts
└── Responsive on mobile ✓
```

### ✅ Admin Panel Works
```
http://YOUR_SITE.pages.dev/admin.html
├── Login with production password ✓
├── "New Post" tab → can create post ✓
├── "All Posts" tab → shows all posts ✓
├── Create → post appears on blog ✓
├── Edit → changes persist ✓
├── Delete → post removed ✓
└── Logout → login again ✓
```

### ✅ Data Persists
```
Verify via Cloudflare Dashboard:
├── KV namespace has posts:index ✓
├── KV namespace has post:1, post:2, post:3 ✓
├── Close browser, reopen site ✓
├── Posts still visible ✓
└── Different browser/device → same posts ✓
```

---

## Sign-Off

- [ ] All items checked
- [ ] No blockers or errors
- [ ] Ready for users to access blog

**Date Deployed**: __________

**Deployed By**: __________

**Notes**: ________________________________________________________________

---

## Rollback Plan (If Needed)

If something goes wrong:

1. **Revert code**: `git revert <commit-hash>` or `git reset HEAD~1`
2. **Redeploy**: `git push origin main` or `wrangler pages deploy .`
3. **Restore KV data**: Re-run seed commands from SEED_POSTS.md
4. **Check logs**: Cloudflare Pages dashboard → Deployments

---

**Deployment Complete! 🎉**
