# Deployment Setup Checklist

Use this checklist to ensure proper deployment setup for the Reflect App.

## Pre-Deployment Setup

### ✅ Repository Configuration

- [ ] Code is committed to GitHub repository
- [ ] All environment variables are documented in `.env.example`
- [ ] Build process works locally: `pnpm build`
- [ ] All tests pass: `pnpm test && pnpm test:e2e`

### ✅ Vercel Account Setup

- [ ] Create Vercel account at [vercel.com](https://vercel.com)
- [ ] Install Vercel CLI: `pnpm install -g vercel`
- [ ] Login to CLI: `vercel login`
- [ ] Connect GitHub account to Vercel

## Vercel Project Configuration

### ✅ Import Project

- [ ] Go to Vercel Dashboard → "Add New..." → "Project"
- [ ] Import from GitHub repository
- [ ] Select the `reflect-app` repository
- [ ] Choose "Deploy" (uses automatic Next.js detection)

### ✅ Environment Variables Setup

#### Production Environment Variables

Configure these in: Project → Settings → Environment Variables

**Required:**

- [ ] `OPENAI_API_KEY` = `your_production_openai_api_key`
- [ ] `OPENAI_MODEL` = `gpt-4-1106-preview`
- [ ] `OPENAI_FALLBACK_MODEL` = `gpt-3.5-turbo-1106`

**Optional (defaults provided):**

- [ ] `OPENAI_MAX_TOKENS` = `500`
- [ ] `OPENAI_TEMPERATURE` = `0.7`
- [ ] `AI_RATE_LIMIT_RPM` = `20`
- [ ] `AI_CACHE_TTL` = `3600`

#### Preview Environment Variables

For preview/staging deployments:

- [ ] `OPENAI_API_KEY` = `your_preview_openai_api_key`
- [ ] `OPENAI_MODEL` = `gpt-3.5-turbo-1106`
- [ ] `AI_RATE_LIMIT_RPM` = `10`
- [ ] `NEXT_PUBLIC_ENV` = `preview`

### ✅ Branch Configuration

- [ ] Verify main branch deploys to Production
- [ ] Verify other branches create Preview deployments
- [ ] Enable "Automatic Deployments" in Git settings

### ✅ Domain Configuration (Optional)

- [ ] Add custom domain in Project → Settings → Domains
- [ ] Configure DNS records as instructed
- [ ] Wait for SSL certificate provisioning

## Post-Deployment Verification

### ✅ Production Deployment

- [ ] Production URL is accessible
- [ ] All pages load correctly
- [ ] AI reflection API works: `/api/reflect`
- [ ] Environment variables are applied correctly
- [ ] Security headers are present (check with browser dev tools)

### ✅ Preview Deployments

- [ ] Create test PR to trigger preview deployment
- [ ] Preview URL is generated and accessible
- [ ] Preview deployment has different environment settings
- [ ] GitHub PR shows deployment status and preview URL

### ✅ Build Performance

- [ ] Build completes in reasonable time (< 2 minutes)
- [ ] Bundle size is optimized
- [ ] No build warnings or errors
- [ ] Image optimization is working

### ✅ Monitoring Setup

- [ ] Enable Vercel Analytics (optional)
- [ ] Configure function timeout monitoring
- [ ] Set up error alerts (optional)

## Testing Checklist

### ✅ Functional Testing

- [ ] All routes are accessible
- [ ] API endpoints respond correctly
- [ ] Form submissions work
- [ ] Theme switching works (light/dark mode)
- [ ] Responsive design works on different screen sizes

### ✅ Performance Testing

- [ ] Page load times are acceptable (< 3s)
- [ ] API response times are acceptable (< 30s for AI)
- [ ] Images load and are optimized
- [ ] No console errors or warnings

### ✅ Security Testing

- [ ] HTTPS is enforced
- [ ] Security headers are present:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: origin-when-cross-origin`
  - `Strict-Transport-Security`
- [ ] Environment variables are not exposed to client
- [ ] API rate limiting is working

## Rollback Plan

### ✅ Rollback Preparation

- [ ] Document current production deployment URL
- [ ] Verify previous deployment is stable
- [ ] Have rollback commands ready:
  ```bash
  vercel rollback [previous-deployment-url]
  ```

## Troubleshooting Common Issues

### ✅ Build Failures

- [ ] Check build logs in Vercel dashboard
- [ ] Verify all dependencies are in package.json
- [ ] Test build locally: `pnpm build`
- [ ] Check for TypeScript/ESLint errors

### ✅ Environment Variable Issues

- [ ] Verify variable names match exactly (case-sensitive)
- [ ] Check if variables are set for correct environment
- [ ] Redeploy after environment variable changes
- [ ] Check variable values don't have quotes unless needed

### ✅ API Route Problems

- [ ] Check function logs: `vercel logs`
- [ ] Verify OpenAI API key is valid
- [ ] Check rate limiting settings
- [ ] Monitor function timeout (30s limit)

## Success Criteria ✅

### Task 16A.1 Complete When:

- [ ] ✅ **Automatic deployments** from main branch to production work
- [ ] ✅ **Preview deployments** are created for all pull requests
- [ ] ✅ **Build optimization** settings are configured for Next.js
- [ ] ✅ **Environment variable** configuration works for different contexts
- [ ] ✅ **GitHub integration** shows deployment status in PRs
- [ ] ✅ **Branch-based deployment** rules are working (main → production, others → preview)
- [ ] ✅ **Deployment URLs** are accessible and functional

---

## Next Steps After Completion

1. **Task 16B**: CI/CD Pipeline Setup (GitHub Actions workflows)
2. **Task 16C**: Environment Configuration (Dev/staging/production environments)
3. **Task 16D**: Monitoring & Error Tracking (Sentry implementation)
4. **Task 16E**: Security & Code Scanning (Snyk and automated security checks)
5. **Task 16F**: Infrastructure & SSL (Domain, SSL certificates, database migrations)
