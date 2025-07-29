# 🚀 Vercel Deployment Guide for AI Component Generator

## Prerequisites
1. GitHub account with your code pushed
2. Vercel account (free tier available)
3. Database provider (Supabase/Neon/Railway)

## 🎯 Deployment Steps

### 1. Set up Database
Choose one:
- **Supabase**: https://supabase.com (Recommended - free tier)
- **Neon**: https://neon.tech (Serverless Postgres)
- **Railway**: https://railway.app (All-in-one)

Get your `DATABASE_URL` connection string.

### 2. Deploy Frontend to Vercel
1. Go to https://vercel.com
2. Click "Import Project" 
3. Connect your GitHub repo
4. Select the root directory (`/accio`)
5. Set these environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-name.vercel.app/api
   NODE_ENV=production
   ```
6. Deploy!

### 3. Deploy Backend to Vercel
1. Create a new Vercel project for backend
2. Connect same GitHub repo
3. Set root directory to `/backend`
4. Set these environment variables:
   ```
   DATABASE_URL=your-postgres-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   GITHUB_TOKEN=your-github-token-here
   GITHUB_MODEL=gpt-4o-mini
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-name.vercel.app
   ```
5. Deploy!

### 4. Update CORS & URLs
1. Update frontend's `NEXT_PUBLIC_API_URL` with backend Vercel URL
2. Update backend's `FRONTEND_URL` with frontend Vercel URL
3. Redeploy both if needed

## 🌐 Alternative: Single Monorepo Deployment
Deploy everything in one Vercel project:
1. Use the root `vercel.json` configuration
2. Set all environment variables in one project
3. Frontend will be at root, backend at `/api/*`

## 🔧 Environment Variables Summary

### Frontend (.env.local):
```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
```

### Backend (.env):
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
GITHUB_TOKEN=ghp_...
GITHUB_MODEL=gpt-4o-mini
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

## 🎉 After Deployment
1. Test user registration/login
2. Test AI component generation
3. Verify live preview works
4. Check all features end-to-end

## 📞 Support
- Vercel Docs: https://vercel.com/docs
- NestJS Vercel: https://docs.nestjs.com/faq/serverless
- Next.js Deployment: https://nextjs.org/docs/deployment
