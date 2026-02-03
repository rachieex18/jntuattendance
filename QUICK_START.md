# ⚡ Quick Start - Deploy to Vercel in 5 Minutes

## 🎯 What You'll Deploy

- **Frontend**: Your Expo web app
- **Backend**: API for email verification and user management
- **All on Vercel**: Single deployment, no separate backend hosting needed

## 📋 Before You Start

Have these ready:
1. ✅ Gmail account (for sending verification emails)
2. ✅ Gmail App Password ([Get it here](https://myaccount.google.com/apppasswords))
3. ✅ Supabase Service Role Key (Dashboard → Settings → API)

## 🚀 Deploy Steps

### 1. Go to Vercel
Visit: https://vercel.com/dashboard

### 2. Import Project
- Click **"Add New Project"**
- Select your GitHub repo: `rachieex18/jntuattendance`
- Click **"Import"**

### 3. Configure Settings

**Build Settings:**
```
Framework Preset:  Other
Build Command:     npm run build
Output Directory:  dist
Install Command:   npm install
```

**Environment Variables:**
```
SENDER_EMAIL=your-gmail@gmail.com
SENDER_PASSWORD=your-gmail-app-password
SUPABASE_URL=https://npxxtdymrjykixszxchd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EXPO_PUBLIC_BACKEND_URL=https://your-project.vercel.app/api
```

Select **All Environments** for each variable.

### 4. Deploy
Click **"Deploy"** → Wait 2-3 minutes

### 5. Update Backend URL
After deployment:
1. Copy your Vercel URL (e.g., `https://jntuattendance.vercel.app`)
2. Go to **Settings → Environment Variables**
3. Edit `EXPO_PUBLIC_BACKEND_URL` to: `https://your-actual-url.vercel.app/api`
4. **Deployments** → **⋯** → **Redeploy**

## ✅ Test Your Deployment

### Frontend
Visit: `https://your-project.vercel.app`
- Should show your app ✅

### Backend API
Visit: `https://your-project.vercel.app/api`
- Should return: `{"status":"ok","message":"JNTU Attendance API is running"}` ✅

## 🎉 Done!

Your app is live! Every push to GitHub will auto-deploy.

## 📚 Need More Details?

See `VERCEL_FULL_DEPLOYMENT.md` for complete documentation.

## 🐛 Issues?

### Website downloads a file instead of loading
→ Check Output Directory is set to `dist`

### API returns 404
→ Make sure you pushed the latest code with `api/` folder

### Emails not sending
→ Verify Gmail App Password is correct in environment variables

### Environment variables not working
→ Redeploy after adding/changing variables
