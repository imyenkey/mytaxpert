#!/bin/bash

# MyTaxPert - Push to GitHub Script
# Run this to push your code to GitHub

echo "🚀 Pushing MyTaxPert to GitHub..."
echo ""

# Add GitHub remote
echo "Step 1: Adding GitHub remote..."
git remote add origin https://github.com/imyenkey/mytaxpert.git

# Rename branch to main
echo "Step 2: Renaming branch to main..."
git branch -M main

# Push code
echo "Step 3: Pushing code to GitHub..."
git push -u origin main

echo ""
echo "✅ Done! Your code is now on GitHub."
echo ""
echo "Next steps:"
echo "1. Go to https://github.com/imyenkey/mytaxpert"
echo "2. Verify all files are there"
echo "3. Connect to Cloudflare Pages (see GITHUB_SETUP.md)"
echo ""
