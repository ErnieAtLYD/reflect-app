# Deployment Guide

This document outlines the deployment configuration and setup for the Reflect App.

## Deployment Platform: Vercel

The application is configured for deployment on Vercel, optimized for Next.js applications.

### Configuration Files

- `vercel.json` - Main Vercel configuration
- `.env.production` - Production environment variables
- `.env.preview` - Preview environment variables
- `.env.example` - Environment variable template

## Deployment Setup

### 1. Vercel Account Setup

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `pnpm install -g vercel`
3. Login to Vercel: `vercel login`

### 2. Project Configuration

1. Connect your GitHub repository to Vercel
2. Import the project in Vercel dashboard
3. Configure environment variables (see below)
4. Deploy: `vercel --prod`

### 3. Environment Variables Configuration

#### Required Environment Variables (Production)

Set these in the Vercel dashboard under Project → Settings → Environment Variables:

```bash
# OpenAI Integration
OPENAI_API_KEY=your_production_openai_api_key
OPENAI_MODEL=gpt-4-1106-preview
OPENAI_FALLBACK_MODEL=gpt-3.5-turbo-1106

# Optional Overrides
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.7
AI_RATE_LIMIT_RPM=20
```

#### Preview Environment Variables

For preview deployments, use more restrictive settings:

```bash
OPENAI_API_KEY=your_preview_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo-1106
AI_RATE_LIMIT_RPM=10
NEXT_PUBLIC_ENV=preview
```

### 4. Branch Configuration

- **Production**: `main` branch → Production deployment
- **Preview**: All other branches → Preview deployments
- **Pull Requests**: Automatic preview deployments

## Deployment Features

### Automatic Deployments

- ✅ Push to `main` → Production deployment
- ✅ Pull requests → Preview deployments with unique URLs
- ✅ GitHub status checks and deployment comments
- ✅ Build optimization for Next.js

### Security Headers

The following security headers are automatically applied:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`

### Performance Optimizations

- ✅ Global CDN distribution
- ✅ Edge function optimization for API routes
- ✅ Automatic image optimization
- ✅ Static asset caching

### Function Configuration

- API route `/api/reflect` has extended timeout (30s) for OpenAI processing
- Optimized for serverless function execution

## Local Development vs Production

### Development

```bash
pnpm dev                    # Port 3000
pnpm dev:e2e               # Port 3002
pnpm test:e2e:dev          # Test against dev server
```

### Production Testing

```bash
pnpm build                 # Build production bundle
pnpm start                 # Start production server (port 3001)
pnpm test:e2e              # Test against production build
```

## Monitoring and Debugging

### Build Logs

- View build logs in Vercel dashboard
- Use `vercel logs` CLI command for function logs

### Performance Monitoring

- Vercel Analytics (when enabled)
- Web Vitals tracking
- Function execution metrics

### Error Tracking

- Consider adding Sentry integration (Task 16D)
- Monitor function timeout and memory usage

## Custom Domain Setup

### Steps to Configure Custom Domain

1. Go to Vercel dashboard → Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate is automatically provisioned

### DNS Configuration Example

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A (for root domain)
Name: @
Value: 76.76.19.61
```

## Rollback and Recovery

### Rollback Deployment

```bash
# Via CLI
vercel rollback [deployment-url]

# Via Dashboard
Project → Deployments → Select previous deployment → Promote to Production
```

### Backup Strategy

- All deployments are preserved in Vercel
- Git history provides code backup
- Environment variables are backed up in Vercel dashboard

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs for TypeScript/ESLint errors
   - Verify all dependencies are in package.json
   - Run `pnpm build` locally to reproduce

2. **Environment Variable Issues**
   - Verify variables are set in correct environment (production/preview)
   - Check variable names match exactly
   - Restart deployments after variable changes

3. **API Route Timeouts**
   - OpenAI API calls are limited to 30s
   - Check network connectivity and API key validity
   - Monitor function execution logs

4. **Preview Deployment Problems**
   - Ensure PR branch is up to date
   - Check if preview deployments are enabled
   - Verify build succeeds on the branch

### Support Commands

```bash
# Check deployment status
vercel ls

# View function logs
vercel logs

# Get deployment info
vercel inspect [deployment-url]

# Force redeploy
vercel --force
```

## Next Steps

After completing this deployment setup:

1. ✅ Task 16A.1: Frontend Deployment Platform (COMPLETED)
2. → Task 16B: CI/CD Pipeline Setup
3. → Task 16C: Environment Configuration
4. → Task 16D: Monitoring & Error Tracking
5. → Task 16E: Security & Code Scanning
6. → Task 16F: Infrastructure & SSL
