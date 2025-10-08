# Full-Stack Deployment Troubleshooting Guide

## Overview
This guide addresses communication issues between:
- **Frontend**: Vercel deployment
- **Backend**: Render deployment at https://civic-reporting-jsfz.onrender.com/
- **Database**: Supabase PostgreSQL

## 1. Environment Variables Verification

### Backend (Render)
Navigate to your Render dashboard → Service → Environment tab:

```bash
# Database Configuration - Use Supabase TRANSACTION MODE connection string
DATABASE_URL=postgresql://postgres.abc123:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
# IMPORTANT: Use port 6543 (transaction mode), NOT 5432
# Get this from: Supabase Dashboard → Settings → Database → Connection String → Transaction Mode

# Server Configuration
NODE_ENV=production
PORT=3001

# CORS Configuration
FRONTEND_URL=https://your-vercel-app.vercel.app

# File Upload (if using cloud storage)
S3_ENDPOINT=your-s3-endpoint
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=your-bucket-name

# Security
JWT_SECRET=your-super-secure-jwt-secret-here
```

### Frontend (Vercel)
In Vercel dashboard → Project → Settings → Environment Variables:

```bash
# API Configuration
VITE_API_URL=https://civic-reporting-jsfz.onrender.com/api
NEXT_PUBLIC_API_URL=https://civic-reporting-jsfz.onrender.com/api

# Maps (if using)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
VITE_MAPBOX_TOKEN=your-mapbox-token
```

### Supabase Configuration
In Supabase dashboard → Settings → Database → Connection String:

**CRITICAL: Use "Transaction" mode, NOT "Session" mode**
1. Select **Transaction** tab (uses port 6543)
2. Copy the connection string
3. Add `?pgbouncer=true` to the end
4. SSL is automatically enabled

Example format:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Why Transaction mode?**
- Session mode (port 5432) may not work with Render's network configuration
- Transaction mode (port 6543) uses PgBouncer which is more compatible with serverless platforms

## 2. API Endpoint Testing

### Test Backend Health
```bash
# Test if backend is responding
curl https://civic-reporting-jsfz.onrender.com/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "database": "Connected",
  "uptime": 123.45
}
```

### Test API Routes
```bash
# Test reports endpoint
curl -X GET https://civic-reporting-jsfz.onrender.com/api/reports

# Test report submission
curl -X POST https://civic-reporting-jsfz.onrender.com/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Report",
    "description": "Testing API",
    "category": "other",
    "address": "Test Location"
  }'
```

### Debug API Routes
Check your backend routing configuration:

```javascript
// backend/src/index.js
app.use('/api', apiRoutes); // Ensure this prefix matches frontend calls

// Verify route definitions
app.get('/api/reports', ...);
app.post('/api/reports', ...);
```

## 3. CORS Configuration

### Backend CORS Setup
Update your backend CORS configuration:

```javascript
// backend/src/index.js
import cors from 'cors';

const corsOptions = {
  origin: [
    'http://localhost:5173', // Development
    'https://your-vercel-app.vercel.app', // Production
    'https://*.vercel.app' // All Vercel preview deployments
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
```

### Verify CORS Headers
Test CORS from browser console:

```javascript
fetch('https://civic-reporting-jsfz.onrender.com/api/reports', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## 4. Database Connection Troubleshooting

### Test Database Connection
Create a test script:

```javascript
// test-db.js
import knex from 'knex';

const config = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: { min: 2, max: 10 },
  ssl: { rejectUnauthorized: false }
};

const db = knex(config);

async function testConnection() {
  try {
    const result = await db.raw('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0]);
    
    const tables = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📊 Tables:', tables.rows.map(r => r.table_name));
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await db.destroy();
  }
}

testConnection();
```

### Common Connection Issues

**SSL Certificate Issues:**
```javascript
// Add to knex configuration
ssl: { 
  rejectUnauthorized: false 
}
```

**Connection Pool Issues:**
```javascript
pool: {
  min: 2,
  max: 10,
  acquireTimeoutMillis: 60000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 100
}
```

## 5. Frontend Configuration

### Update API Client
```javascript
// frontend/src/config/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://civic-reporting-jsfz.onrender.com/api';

export const apiClient = {
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },
  
  post: async (endpoint, data) => {
    try {
      const isFormData = data instanceof FormData;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: isFormData ? {} : {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: isFormData ? data : JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  }
};
```

### Error Handling in Components
```javascript
// frontend/src/pages/ReportForm.jsx
const handleSubmit = async () => {
  setLoading(true);
  
  try {
    console.log('Submitting to:', import.meta.env.VITE_API_URL);
    
    const response = await apiClient.post('/reports', formData);
    
    if (response.success && response.data?.id) {
      setReportId(response.data.id);
      setSubmitted(true);
    } else {
      throw new Error('Invalid response format');
    }
    
  } catch (error) {
    console.error('Submit error:', {
      message: error.message,
      stack: error.stack,
      apiUrl: import.meta.env.VITE_API_URL
    });
    
    // Specific error messages
    if (error.message.includes('Failed to fetch')) {
      alert('Cannot connect to server. Please check your internet connection.');
    } else if (error.message.includes('404')) {
      alert('API endpoint not found. Please contact support.');
    } else if (error.message.includes('500')) {
      alert('Server error. Please try again later.');
    } else {
      alert(`Error: ${error.message}`);
    }
  } finally {
    setLoading(false);
  }
};
```

## 6. Deployment Verification

### Pre-Deployment Checklist

**Backend (Render):**
- [ ] Environment variables are set correctly
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] Health check endpoint responds
- [ ] Database migrations run successfully
- [ ] CORS is configured for production domain

**Frontend (Vercel):**
- [ ] Environment variables include production API URL
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist` (for Vite) or `build` (for CRA)
- [ ] API calls use environment variables
- [ ] Error handling is implemented

**Database (Supabase):**
- [ ] Connection string is correct
- [ ] SSL is enabled
- [ ] Tables exist and have correct schema
- [ ] Connection pooling is enabled

### Monitoring and Logs

**Render Logs:**
```bash
# View logs in Render dashboard
# Or use Render CLI
render logs --service your-service-id --tail
```

**Vercel Logs:**
```bash
# View function logs in Vercel dashboard
# Or use Vercel CLI
vercel logs your-deployment-url
```

**Browser Network Tab:**
- Check if requests are being made to correct URLs
- Verify response status codes
- Check for CORS errors in console

### Common Deployment Pitfalls

1. **Environment Variable Mismatch:**
   - Frontend uses `VITE_` prefix for Vite
   - Backend uses standard names
   - Ensure no trailing slashes in URLs

2. **Build Path Issues:**
   - Verify static file paths are correct
   - Check if assets are being served properly

3. **Database Connection Limits:**
   - Use connection pooling
   - Monitor active connections in Supabase

4. **Cold Start Issues (Render):**
   - First request may be slow
   - Implement health check warming

### Testing Production Deployment

```javascript
// Test script to run after deployment
const testEndpoints = async () => {
  const baseUrl = 'https://civic-reporting-jsfz.onrender.com';
  
  const tests = [
    { name: 'Health Check', url: `${baseUrl}/health` },
    { name: 'Reports List', url: `${baseUrl}/api/reports` },
    { name: 'Departments', url: `${baseUrl}/api/departments` }
  ];
  
  for (const test of tests) {
    try {
      const response = await fetch(test.url);
      console.log(`✅ ${test.name}: ${response.status}`);
    } catch (error) {
      console.error(`❌ ${test.name}: ${error.message}`);
    }
  }
};

testEndpoints();
```

## Quick Fix Commands

```bash
# Restart Render service
curl -X POST "https://api.render.com/v1/services/YOUR_SERVICE_ID/restart" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Redeploy Vercel
vercel --prod

# Test API connectivity
curl -I https://civic-reporting-jsfz.onrender.com/health

# Check DNS resolution
nslookup civic-reporting-jsfz.onrender.com
```

## Emergency Rollback Plan

1. **Revert to last working commit**
2. **Check environment variables haven't changed**
3. **Verify database schema is compatible**
4. **Test with minimal payload first**
5. **Gradually restore full functionality**

---

**Next Steps:**
1. Start with environment variable verification
2. Test each service independently
3. Test service-to-service communication
4. Monitor logs during testing
5. Implement proper error handling
6. Set up monitoring and alerts