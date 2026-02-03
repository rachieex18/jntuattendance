# 🚀 Hosting your JNTUH Attendance Tracker

This project is now ready to be hosted as a professional MVP. Follow these steps to get it online.

## 1. Deployed Backend (The Server)
The backend handles emails and Supabase user creation.
- **Recommended Host**: [Render](https://render.com) or [Railway](https://railway.app).
- **Steps**:
  1. Connect your GitHub repository.
  2. Set the "Root Directory" to `server`.
  3. Standard build: `npm install`.
  4. Start command: `npm start`.
  5. **Environment Variables**: Copy all variables from your `server/.env` to the Render dashboard.
  6. Copy your deployed Backend URL (e.g., `https://my-api.onrender.com`).

## 2. Deployed Frontend (The Website)
The frontend is the user interface.
- **Recommended Host**: [Vercel](https://vercel.com) (Best for Expo/React web).
- **Steps**:
  1. Connect your GitHub repository.
  2. Set the "Framework Preset" to **Other**.
  3. **Build Command**: `npm run build` (This runs `npx expo export`).
  4. **Output Directory**: `dist` (⚠️ **CRITICAL**: Change this from `public` to `dist`).
  5. **Environment Variables**: Add `EXPO_PUBLIC_BACKEND_URL` and set it to your **Backend URL** from Step 1.
  6. Deploy!

## 3. Post-Deployment Checks
- **CORS**: The backend is already configured to allow all origins, so it should work immediately.
- **Supabase**: Ensure your Supabase project's "Allowed Redirect URLs" includes your new Vercel URL.

### Current Project State
- ✅ Responsive Landing Page on Web
- ✅ SPA Routing for Vercel
- ✅ Production Build Scripts
- ✅ Environment Variable Support
