# 🔐 Environment Variables Setup Guide

## 📁 File Structure

```
jntuxatt/
├── .env                    # Local development (DO NOT COMMIT)
├── .env.production        # Production values (DO NOT COMMIT)
├── .env.example          # Template (safe to commit)
└── server/.env           # Legacy server config (DO NOT COMMIT)
```

## 🚫 What's Ignored by Git

These files are in `.gitignore` and will NOT be committed:
- `.env`
- `.env.production` 
- `.env.development`
- `.env*.local`
- `server/.env`

## 🔧 Setup Steps

### 1. Local Development

```bash
# Copy the template
cp .env.example .env

# Edit .env with your actual values
nano .env
```

Fill in your real API keys in `.env`:
```
SENDER_EMAIL=youremail@gmail.com
SENDER_PASSWORD=your-actual-app-password
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000
```

### 2. Vercel Production

Don't upload .env files to Vercel! Instead:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable manually:

```
SENDER_EMAIL = youremail@gmail.com
SENDER_PASSWORD = your-actual-app-password  
SUPABASE_URL = https://npxxtdymrjykixszxchd.supabase.co
SUPABASE_SERVICE_ROLE_KEY = your-actual-service-role-key
EXPO_PUBLIC_BACKEND_URL = https://jntuxattendance.vercel.app/api
```

3. Select "All Environments" for each
4. Redeploy your project

## 🔑 How to Get API Keys

### Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and your device
3. Copy the generated 16-character password
4. Use this password, NOT your regular Gmail password

### Supabase Service Role Key
1. Go to Supabase Dashboard
2. Select your project
3. Settings → API
4. Copy the "service_role" key (not anon key)
5. This key has admin privileges - keep it secret!

## ⚠️ Security Best Practices

### ✅ DO:
- Keep .env files local only
- Use different keys for development vs production
- Rotate keys regularly
- Use Vercel's environment variable dashboard
- Double-check .gitignore includes .env files

### ❌ DON'T:
- Commit .env files to GitHub
- Share API keys in chat/email
- Use production keys in development
- Hardcode secrets in source code
- Upload .env files to Vercel

## 🧪 Testing Your Setup

### Local Development
```bash
# Start local server
npm run web

# Check if env vars are loaded
console.log(process.env.EXPO_PUBLIC_BACKEND_URL)
```

### Production
```bash
# Test API endpoint
curl https://jntuxattendance.vercel.app/api

# Should return: {"status":"ok","message":"JNTU Attendance API is running"}
```

## 🔄 Environment Variable Flow

```
Development:
.env → Local Expo app → http://localhost:3000

Production:
Vercel Dashboard → Deployed app → https://jntuxattendance.vercel.app/api
```

## 📝 Quick Reference

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `SENDER_EMAIL` | Gmail for sending OTPs | Your Gmail address |
| `SENDER_PASSWORD` | Gmail authentication | Google App Passwords |
| `SUPABASE_URL` | Database connection | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Database admin access | Supabase API settings |
| `EXPO_PUBLIC_BACKEND_URL` | Frontend → Backend connection | Your Vercel URL + /api |

## 🆘 Troubleshooting

### "Environment variable not found"
- Check spelling and case sensitivity
- Restart development server after changing .env
- Verify .env file is in project root

### "Gmail authentication failed"
- Use App Password, not regular password
- Enable 2FA on Gmail account first
- Check for typos in email/password

### "Supabase unauthorized"
- Use service_role key, not anon key
- Check key hasn't expired
- Verify project URL is correct

### "Backend API not found"
- Check EXPO_PUBLIC_BACKEND_URL format
- Ensure it ends with /api
- Verify Vercel deployment is successful