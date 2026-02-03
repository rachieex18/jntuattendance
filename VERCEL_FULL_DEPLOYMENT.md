# 🚀 Complete Vercel Deployment Guide (Frontend + Backend)

This guide will help you deploy both the frontend (Expo web app) and backend (API) on Vercel.

## 📋 What's Been Set Up

✅ Frontend: Expo web app builds to `dist/` folder
✅ Backend: Express API converted to Vercel serverless functions in `api/` folder
✅ Routing: Configured to handle both frontend and API routes
✅ Environment variables: Ready to be configured

## 🔧 Step 1: Vercel Dashboard Configuration

### 1.1 Connect Your Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: `rachieex18/jntuattendance`
4. Click **"Import"**

### 1.2 Configure Build Settings

In the project configuration screen:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Other` |
| **Root Directory** | `.` (leave empty/default) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 1.3 Add Environment Variables

Click **"Environment Variables"** and add these:

#### Required Variables:

```
SENDER_EMAIL=your-gmail@gmail.com
SENDER_PASSWORD=your-gmail-app-password
SUPABASE_URL=https://npxxtdymrjykixszxchd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
EXPO_PUBLIC_BACKEND_URL=https://your-project.vercel.app/api
```

**Important Notes:**
- `SENDER_EMAIL`: Your Gmail address for sending verification emails
- `SENDER_PASSWORD`: Gmail App Password (not your regular password)
  - Get it from: https://myaccount.google.com/apppasswords
- `SUPABASE_SERVICE_ROLE_KEY`: Get from Supabase Dashboard → Settings → API
- `EXPO_PUBLIC_BACKEND_URL`: Will be `https://your-project-name.vercel.app/api`
  - You can update this after first deployment

**Environment Selection:** Select **All** (Production, Preview, Development)

### 1.4 Deploy

Click **"Deploy"** and wait for the build to complete (~2-3 minutes)

## 🔄 Step 2: Update Backend URL (After First Deploy)

After your first deployment:

1. Copy your Vercel project URL (e.g., `https://jntuattendance.vercel.app`)
2. Go to **Settings → Environment Variables**
3. Update `EXPO_PUBLIC_BACKEND_URL` to: `https://your-project.vercel.app/api`
4. Go to **Deployments** → Click **⋯** → **Redeploy**

## 🧪 Step 3: Test Your Deployment

### Test Frontend
Visit: `https://your-project.vercel.app`
- Should show your app's landing page
- No file downloads!

### Test Backend API
Visit: `https://your-project.vercel.app/api`
- Should return: `{"status":"ok","message":"JNTU Attendance API is running"}`

### Test API Endpoints

```bash
# Test signup
curl -X POST https://your-project.vercel.app/api/signup-with-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User","rollNo":"123456","regulation":"R22"}'
```

## 📁 Project Structure

```
jntuxatt/
├── api/                    # Backend serverless functions
│   ├── index.js           # Main API handler
│   └── package.json       # API dependencies
├── dist/                  # Frontend build output (auto-generated)
│   └── index.html
├── src/                   # Frontend source code
├── vercel.json           # Vercel configuration
└── package.json          # Frontend dependencies
```

## 🔀 How Routing Works

Vercel routes requests based on the path:

- `/api/*` → Backend serverless function (`api/index.js`)
- `/*` → Frontend static files from `dist/`

Examples:
- `https://your-app.vercel.app/` → Frontend (index.html)
- `https://your-app.vercel.app/api` → Backend health check
- `https://your-app.vercel.app/api/signup-with-otp` → Backend signup endpoint

## ⚠️ Important Notes

### In-Memory Storage Limitation

The backend uses in-memory storage (Map) for OTP codes and pending users. This has limitations in serverless:

- **Cold starts** will reset the memory
- **Multiple instances** don't share memory

**For Production:** Consider using:
- [Upstash Redis](https://upstash.com/) (free tier available)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv)

### Gmail App Password

To send emails, you need a Gmail App Password:

1. Go to https://myaccount.google.com/apppasswords
2. Create a new app password
3. Use that password in `SENDER_PASSWORD` env var

## 🐛 Troubleshooting

### Issue: Website downloads a file
**Fix:** Make sure Output Directory is set to `dist` in Vercel settings

### Issue: API returns 404
**Fix:** Check that `vercel.json` exists and routes are configured correctly

### Issue: Environment variables not working
**Fix:** 
- Frontend vars must start with `EXPO_PUBLIC_`
- Redeploy after adding/changing env vars

### Issue: Emails not sending
**Fix:**
- Verify Gmail App Password is correct
- Check Vercel function logs for errors

### Issue: OTP expired immediately
**Fix:** This happens with cold starts. Consider using external storage like Upstash Redis

## 📊 Monitoring

View logs and errors:
1. Go to Vercel Dashboard
2. Select your project
3. Click **"Logs"** tab
4. Filter by function: `api/index.js`

## 🔄 Continuous Deployment

Every push to your `main` branch will automatically:
1. Trigger a new Vercel deployment
2. Build the frontend (`expo export`)
3. Deploy the backend serverless function
4. Update your live site

## 📝 Local Development

```bash
# Install dependencies
npm install

# Run frontend locally
npm run web

# Backend will still use Vercel deployment
# Or run backend locally: cd server && npm start
```

## ✅ Deployment Checklist

- [ ] Repository connected to Vercel
- [ ] Build settings configured (Framework: Other, Output: dist)
- [ ] All environment variables added
- [ ] First deployment successful
- [ ] Backend URL updated in env vars
- [ ] Redeployed after URL update
- [ ] Frontend loads correctly (no download)
- [ ] API health check returns OK
- [ ] Test signup flow works
- [ ] Emails are being sent

## 🎉 You're Done!

Your app is now live on Vercel with both frontend and backend!

**Frontend:** `https://your-project.vercel.app`
**Backend API:** `https://your-project.vercel.app/api`
