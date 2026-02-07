# 🚀 Deployment Guide

This guide will help you deploy your Health-Queue application and set up automatic deployments.

## 📋 Prerequisites

1. A GitHub account (you already have the repository set up)
2. Your Supabase credentials (already in your `.env.local` file)

---

## Option 1: Deploy to Vercel (Recommended - Easiest)

Vercel provides automatic deployments and is optimized for Vite/React applications.

### Steps:

1. **Go to [Vercel](https://vercel.com)** and sign in with your GitHub account

2. **Click "Add New Project"**

3. **Import your GitHub repository:**
   - Select `officialjesprec/Health-Queue`
   - Click "Import"

4. **Configure Project:**
   - Framework Preset: Vercel will automatically detect "Vite"
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   VITE_SUPABASE_URL = your_supabase_url
   VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
   ```
   (Get these from your `.env.local` file)

6. **Click "Deploy"**

### ✅ Automatic Updates:
Once deployed, **every time you push changes to GitHub**, Vercel will:
- Automatically detect the changes
- Build your application
- Deploy the new version
- Give you a preview URL

**That's it! Your app is now live and auto-updates on every git push!**

---

## Option 2: Deploy to GitHub Pages

This option uses GitHub Actions for automatic deployment.

### Steps:

1. **Enable GitHub Pages:**
   - Go to your repository: https://github.com/officialjesprec/Health-Queue
   - Click "Settings" → "Pages"
   - Under "Source", select "GitHub Actions"

2. **Add Secrets:**
   - Go to "Settings" → "Secrets and variables" → "Actions"
   - Click "New repository secret"
   - Add these two secrets:
     ```
     Name: VITE_SUPABASE_URL
     Value: [your Supabase URL from .env.local]
     
     Name: VITE_SUPABASE_ANON_KEY
     Value: [your Supabase anon key from .env.local]
     ```

3. **Update vite.config.ts:**
   You need to set the base URL for GitHub Pages. The repository name should be used as the base.

4. **Push your code** (instructions below)

### ✅ Automatic Updates:
The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:
- Automatically run on every push to the `main` branch
- Build your application
- Deploy to GitHub Pages
- Your site will be available at: `https://officialjesprec.github.io/Health-Queue/`

---

## Option 3: Deploy to Netlify

Similar to Vercel, very easy setup:

1. Go to [Netlify](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables (same as Vercel)
6. Deploy!

---

## 🔄 Pushing Your Code to GitHub

Now that everything is configured, let's push your code:

```bash
# Stage all changes
git add .

# Commit with a message
git commit -m "Add deployment configuration and auto-deploy setup"

# Push to GitHub
git push origin main
```

After pushing:
- **Vercel/Netlify**: Will automatically detect and deploy
- **GitHub Pages**: GitHub Actions will trigger and deploy

---

## 🎯 Quick Start Commands

```bash
# Check current status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub (triggers auto-deployment)
git push origin main
```

---

## 🔍 Monitoring Deployments

### Vercel:
- Dashboard: https://vercel.com/dashboard
- See all deployments, logs, and preview URLs

### GitHub Pages:
- Go to your repo → "Actions" tab
- See the deployment status and logs

### Netlify:
- Dashboard: https://app.netlify.com
- See deployment logs and site analytics

---

## ⚠️ Important Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Always use environment variables** for sensitive data
3. **Test locally first** before pushing:
   ```bash
   npm run build
   npm run preview
   ```

---

## 🔗 Your Repository

**GitHub Repository:** https://github.com/officialjesprec/Health-Queue

---

## 🆘 Troubleshooting

### Build fails on deployment:
- Check that all environment variables are set correctly
- Review the build logs in your deployment platform
- Ensure `npm run build` works locally

### Routing doesn't work (404 errors):
- Vercel/Netlify: Should work automatically with the `vercel.json` config
- GitHub Pages: You might need to add a `404.html` that redirects to `index.html`

### Environment variables not working:
- Make sure they're prefixed with `VITE_`
- Verify they're set in your deployment platform's settings
- Rebuild the project after adding/changing variables

---

## 📞 Support

If you encounter any issues:
1. Check the deployment logs
2. Verify environment variables are set
3. Test the build locally first
4. Check that your Supabase instance is accessible
