# 🚀 Vercel Deployment Guide for AI Component Generator

## Prerequisites
1. GitHub account with your code pushed to `ai-components` repository
2. Vercel account (free tier available)
3. GitHub Personal Access Token with GitHub Models access

## 🎯 Deployment Steps

### 1. Single Monorepo Deployment (Recommended)
This project is configured for single-deployment on Vercel:

1. **Import Project to Vercel**
   - Go to https://vercel.com
   - Click "Import Project"
   - Connect your GitHub repository: `BhavaniPrasadBhavani/ai-components`
   - Vercel will automatically detect it's a Next.js project

2. **Set Environment Variables**
   In your Vercel dashboard, add these environment variables:
   ```
   LLM_API_KEY=your_github_token_here
   LLM_BASE_URL=https://models.inference.ai.azure.com
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy both frontend and backend
   - Frontend will be accessible at your domain root
   - Backend API will be accessible at `/api/*`

### 2. Architecture Overview
- **Frontend**: Next.js app at root (`/`)
- **Backend**: NestJS API functions at `/api/*`
- **API Handler**: Single entry point at `/api/index.ts`
- **Configuration**: Monorepo setup via `vercel.json`

### 3. Getting Your GitHub Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token (classic)
3. Select these scopes:
   - `repo` (if repository is private)
   - Enable "GitHub Models" access (in beta)
4. Copy the token and use it as `LLM_API_KEY`

## 🔧 Environment Variables Summary

### Required for Deployment:
```
LLM_API_KEY=ghp_your_github_token_here
LLM_BASE_URL=https://models.inference.ai.azure.com
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### How it Works:
- The `/api/index.ts` file serves as the serverless function entry point
- All NestJS controllers and services are bundled into this single function
- Frontend makes API calls to `/api/*` which are handled by the backend
- No separate deployment needed - everything is in one Vercel project

## 🎉 After Deployment
1. Visit your Vercel app URL
2. Test the AI component generation
3. Try generating different types of components
4. Verify the live preview works
5. Check that CSS styling is properly applied

## 🛠️ Troubleshooting

### Common Issues:
1. **Build Errors**: Check that all dependencies are in the root `package.json`
2. **API Errors**: Verify environment variables are set correctly
3. **CORS Issues**: Check that origins are properly configured in `api/index.ts`
4. **GitHub Models Access**: Ensure your token has proper permissions

### Logs:
- Check Vercel Function logs in the dashboard
- Use Vercel CLI: `vercel logs`

## 📞 Resources
- Vercel Docs: https://vercel.com/docs
- GitHub Models: https://github.com/marketplace/models
- Next.js Deployment: https://nextjs.org/docs/deployment
- NestJS Serverless: https://docs.nestjs.com/faq/serverless
