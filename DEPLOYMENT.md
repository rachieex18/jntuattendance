# 🚀 Hosting your JNTUH Attendance Tracker

This project is now ready to be hosted as a professional MVP on Vercel (both frontend and backend).

## Quick Deploy to Vercel

Both the frontend (Expo web app) and backend (API) are configured to deploy together on Vercel.

### Prerequisites
- GitHub account with this repository
- Vercel account (free tier works)
- Gmail account for sending verification emails
- Supabase project set up

### Deployment Steps

1. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Import"

2. **Configure Build Settings**
   - Framework Preset: `Other`
   - Build Command: `npm run build`
   - Output Directory: `dist` ⚠️ **CRITICAL**
   - Install Command: `npm install`

3. **Add Environment Variables**
   ```
   SENDER_EMAIL=your-gmail@gmail.com
   SENDER_PASSWORD=your-gmail-app-password
   SUPABASE_URL=https://npxxtdymrjykixszxchd.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   EXPO_PUBLIC_BACKEND_URL=https://jntuxattendance.vercel.app/api
   ```

4. **Deploy**
   - Click "Deploy" and wait for build to complete
   - After first deploy, update `EXPO_PUBLIC_BACKEND_URL` with your actual Vercel URL
   - Redeploy

### What Gets Deployed

- **Frontend**: Static Expo web app at `https://jntuxattendance.vercel.app`
- **Backend API**: Serverless functions at `https://jntuxattendance.vercel.app/api`

### Post-Deployment

- **Supabase**: Add your Vercel URL to Supabase "Allowed Redirect URLs"
- **Gmail**: Set up App Password at https://myaccount.google.com/apppasswords

## 📚 Detailed Documentation

See `VERCEL_FULL_DEPLOYMENT.md` for complete step-by-step instructions.

### Current Project State
- ✅ Responsive Landing Page on Web
- ✅ SPA Routing for Vercel
- ✅ Production Build Scripts
- ✅ Environment Variable Support
- ✅ Backend API as Serverless Functions
- ✅ Unified Vercel Deployment
