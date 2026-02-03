# 🎯 Vercel Dashboard Settings - Copy & Paste Guide

## Step 1: Go to Your Vercel Project Settings

1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **jntuxatt**
3. Click **Settings** tab
4. Click **Build & Output** in the left sidebar

## Step 2: Configure Build Settings

Copy these exact values into the Vercel dashboard:

### Framework Preset
```
Other
```

### Build Command
```
npm run build
```

### Output Directory
```
dist
```
⚠️ **CRITICAL**: This MUST be `dist` not `public`

### Install Command
```
npm install
```

## Step 3: Add Environment Variables

1. In Settings, click **Environment Variables**
2. Add this variable:

**Name:**
```
EXPO_PUBLIC_BACKEND_URL
```

**Value:**
```
https://your-backend-url.onrender.com
```
(Replace with your actual backend URL from Render/Railway)

**Environment:** Select all (Production, Preview, Development)

## Step 4: Redeploy

1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Wait for the build to complete

## ✅ What Should Happen

- Build runs `npm run build` → executes `expo export`
- Static files generated in `dist/` folder
- Vercel serves `dist/index.html` as the entry point
- Your website loads correctly (no file download!)

## 🐛 If It Still Downloads a File

1. Double-check Output Directory is exactly: `dist`
2. Make sure Framework Preset is: `Other`
3. Clear Vercel cache: Settings → General → Clear Cache
4. Redeploy again

## 📝 Notes

- Changes pushed to GitHub will auto-deploy
- The `vercel.json` file is already configured correctly
- No manual file uploads needed
- Build time: ~1-2 minutes
