# Vercel Deployment Guide for Expo Web App

## Quick Setup Checklist

### ✅ What's Already Done
- ✅ `vercel.json` configured correctly
- ✅ `dist/` folder in .gitignore (Vercel builds it)
- ✅ `node_modules/` in .gitignore
- ✅ No "main" field in package.json that confuses Vercel
- ✅ Build command set to `expo export`

### 🔧 Vercel Dashboard Settings

Go to your Vercel project → **Settings → Build & Output**

| Setting | Value |
|---------|-------|
| Framework Preset | `Other` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 🌍 Environment Variables

Add these in Vercel → **Settings → Environment Variables**:

```
EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.onrender.com
```

## How It Works

1. **Build Process**:
   - Vercel runs `npm install`
   - Vercel runs `npm run build` (which executes `expo export`)
   - Expo generates static files in `dist/` folder
   - `dist/index.html` is your main entry point

2. **Serving**:
   - Vercel serves everything from the `dist/` folder
   - `vercel.json` handles clean URLs and trailing slashes
   - No rewrites needed - Expo handles routing internally

## Troubleshooting

### Issue: Browser downloads a file instead of showing the website
**Cause**: Output Directory is not set to `dist`
**Fix**: Go to Vercel Settings → Build & Output → Set Output Directory to `dist`

### Issue: 404 errors on routes
**Cause**: Expo's routing is handled client-side
**Fix**: Already handled by Expo's static export - no action needed

### Issue: Environment variables not working
**Cause**: Variables must be prefixed with `EXPO_PUBLIC_`
**Fix**: Ensure all frontend env vars start with `EXPO_PUBLIC_`

## Deployment Commands

```bash
# Build locally to test
npm run build

# Check the dist folder
ls -la dist/

# Commit and push changes
git add .
git commit -m "Fix Vercel deployment configuration"
git push

# Vercel will auto-deploy on push
```

## What NOT to Do

❌ Don't commit `node_modules/` folder
❌ Don't commit `dist/` folder
❌ Don't add a "main" field to package.json
❌ Don't set Framework Preset to anything other than "Other"
❌ Don't change the Output Directory from "dist"
