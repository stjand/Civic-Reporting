# Civic Reporting App - Deployment Guide

## ✅ Issues Fixed

All critical deployment issues have been resolved:

1. **Database Connection** - ✅ Working (connects to Supabase PostgreSQL)
2. **Health Check Endpoint** - ✅ Added at `/health`
3. **CORS Configuration** - ✅ Updated to support all Vercel preview deployments
4. **Environment Variables** - ✅ Fixed NODE_ENV and created .env.example templates
5. **Database Schema** - ✅ Already exists in Supabase with all necessary tables

## Backend Deployment (Render)

### Environment Variables to Set in Render

Go to your Render dashboard → Service → Environment:

```
DATABASE_URL=postgresql://postgres.fyixddxbcvahtjhausgv:MURDeQWhL3ZragVH@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
JWT_SECRET=supersecretkey@12345678@^*^
NODE_ENV=production
PORT=3001
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aXhkZHhiY3ZhaHRqaGF1c2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTgyNjIsImV4cCI6MjA3Mzk3NDI2Mn0.N5YCret-w2FW2vm7Qj2qlGHmNnAo3dJUxi0bqy-KL7M
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aXhkZHhiY3ZhaHRqaGF1c2d2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM5ODI2MiwiZXhwIjoyMDczOTc0MjYyfQ.OISBF6nvhoK9pXAsHKh8DVxHMi-AmnZk3haFrWK1RTs
SUPABASE_URL=https://fyixddxbcvahtjhausgv.supabase.co
```

### Build & Start Commands

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Root Directory**: `backend`

### Health Check

- **Health Check Path**: `/health`
- **Expected Response**: `{"status":"OK","timestamp":"...","database":"Connected",...}`

## Frontend Deployment (Vercel)

### Environment Variables to Set in Vercel

Go to Vercel dashboard → Project → Settings → Environment Variables:

```
VITE_API_URL=https://civic-reporting-jsfz.onrender.com/api
```

### Build Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Root Directory**: `frontend`

## Local Testing

### Backend
```bash
cd backend
npm install
npm start
# Backend will run on http://localhost:3001
# Test health: curl http://localhost:3001/health
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend will run on http://localhost:5173
```

### Full Stack (from root)
```bash
npm install
npm run dev
# Runs both frontend and backend concurrently
```

## Testing Your Deployment

### 1. Test Backend Health (Render)
```bash
curl https://civic-reporting-jsfz.onrender.com/health
```
Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-01-26T...",
  "database": "Connected",
  "uptime": "123s",
  "environment": "production"
}
```

### 2. Test API Endpoints (Render)
```bash
# Test if API is accessible
curl https://civic-reporting-jsfz.onrender.com/api/reports
```

### 3. Test Frontend (Vercel)
1. Open your Vercel deployment URL
2. Open browser console (F12)
3. Check for CORS errors (there should be none)
4. Try logging in or registering
5. Try submitting a report

## Common Issues & Solutions

### Issue: Render service fails to start
**Solution**: Check the logs in Render dashboard. Most likely:
- Missing environment variable
- Database connection issue

### Issue: Frontend can't connect to backend
**Solution**: 
- Verify `VITE_API_URL` is set in Vercel
- Check CORS errors in browser console
- Ensure backend health check is passing

### Issue: Database errors
**Solution**:
- Verify DATABASE_URL is correct in Render
- Check Supabase project is not paused
- Ensure Supabase connection pooling is enabled

### Issue: "Cold start" delays on Render
**Solution**: 
- On free tier, Render spins down after inactivity
- First request after inactivity will be slow
- This is normal and expected

## Post-Deployment Checklist

- [ ] Backend health check returns 200 OK
- [ ] Frontend loads without errors
- [ ] User can register/login
- [ ] User can submit a report
- [ ] Images upload to Supabase storage
- [ ] Reports appear in database
- [ ] No CORS errors in browser console

## Monitoring

- **Backend Logs**: Render Dashboard → Logs
- **Frontend Logs**: Vercel Dashboard → Deployments → Function Logs
- **Database**: Supabase Dashboard → Database → Tables

## Support

If you encounter issues:
1. Check the logs in respective platforms
2. Verify all environment variables are set correctly
3. Test individual services (backend, frontend, database) separately
4. Review the browser console for client-side errors
