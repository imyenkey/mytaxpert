# Deploy MyTaxPert to Cloudflare Pages

Your project is now ready to deploy! Here's the easiest way to get it live on Cloudflare Pages.

## Prerequisites
- Cloudflare account (free tier works!)
- Git repository initialized ✅ (already done)
- GitHub account (recommended for easier deployment)

---

## Option 1: Deploy via GitHub (Recommended - Easiest)

### Step 1: Create GitHub Repository
```bash
# Create a new repo on github.com (don't initialize with README)
# Then push your local code:

git remote add origin https://github.com/YOUR_USERNAME/mytaxpert.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Cloudflare Pages
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select **Pages** from left sidebar
3. Click **Create a project**
4. Select **Connect to Git**
5. Authorize GitHub and select `mytaxpert` repository
6. **Build settings:**
   - Framework: `None` (or leave blank)
   - Build command: (leave empty)
   - Build output directory: `.` (root directory)
7. Click **Save and Deploy**

**That's it!** Your site will deploy automatically whenever you push to GitHub.

---

## Option 2: Deploy via Command Line (CLI)

### Step 1: Install Wrangler
```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare
```bash
wrangler login
# Opens browser to authorize
```

### Step 3: Deploy
```bash
wrangler pages deploy .
```

Your site will be live at: `https://YOUR_PROJECT_NAME.pages.dev`

---

## Step 3: Set Admin Password (Important!)

After deployment, set your admin panel password:

```bash
# For production
wrangler pages secret put ADMIN_PASSWORD --env production

# For preview deployments
wrangler pages secret put ADMIN_PASSWORD --env preview
```

When prompted, enter your desired admin password.

---

## Step 4: Create KV Namespaces

```bash
# Create the blog KV namespace
wrangler kv:namespace create "BLOG_KV" --preview false
wrangler kv:namespace create "BLOG_KV" --preview true

# Copy the namespace IDs from the output
```

### Update wrangler.toml
Replace placeholder IDs with actual namespace IDs:

```toml
[[env.production.kv_namespaces]]
binding = "BLOG_KV"
id = "YOUR_PRODUCTION_ID"

[[env.preview.kv_namespaces]]
binding = "BLOG_KV"
id = "YOUR_PREVIEW_ID"
```

---

## Step 5: Seed Initial Blog Posts (Optional)

If you want sample blog posts:

```bash
# Replace NAMESPACE_ID with your actual ID
wrangler kv:key put --namespace-id=NAMESPACE_ID post:1 '{"id":1,"title":"Getting Started with GST","slug":"gst-guide","body":"...","category":"gst","status":"published","createdAt":"2026-01-15"}'
```

Or use the commands from `SEED_POSTS.md`

---

## Deployment Checklist

- [ ] Created GitHub account
- [ ] Pushed code to GitHub
- [ ] Connected GitHub to Cloudflare Pages
- [ ] First deployment successful
- [ ] Set admin password via `wrangler pages secret put`
- [ ] Created KV namespaces
- [ ] Updated wrangler.toml with namespace IDs
- [ ] Tested admin panel login
- [ ] Seeded sample blog posts (optional)
- [ ] Tested blog features

---

## Access Your Live Site

**Main Site:**
```
https://your-project-name.pages.dev/
```

**Admin Panel:**
```
https://your-project-name.pages.dev/admin.html
```
(Enter your password)

**Blog:**
```
https://your-project-name.pages.dev/blog.html
```

---

## Continuous Deployment

With GitHub connected:
1. Make changes locally
2. Commit: `git commit -m "Your message"`
3. Push: `git push origin main`
4. **Automatic deployment starts!**
5. Check progress in Cloudflare Pages dashboard

---

## Troubleshooting

### Blog features not working?
- ✅ Verify KV namespaces created
- ✅ Check namespace IDs in wrangler.toml match
- ✅ Admin password set via secrets

### Admin password not working?
```bash
# Re-set the password
wrangler pages secret put ADMIN_PASSWORD --env production
```

### Build failing?
- ✅ Check wrangler.toml syntax
- ✅ Ensure all files are committed to git
- ✅ No node_modules in git (should be in .gitignore)

---

## Next Steps

1. **Custom Domain** (optional):
   - Go to Cloudflare Pages → Settings → Custom domain
   - Add your domain (e.g., www.mytaxpert.org)

2. **SSL/TLS** (automatic):
   - Cloudflare provides free HTTPS by default

3. **Analytics**:
   - Cloudflare Pages provides free analytics in dashboard

---

## Need Help?

Refer to:
- `CLOUDFLARE_SETUP.md` - Detailed Cloudflare setup guide
- `QUICK_START.md` - 60-second setup summary
- `README_CLOUDFLARE.md` - Architecture overview
