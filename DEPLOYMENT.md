# Deployment Guide for A to Z Family Homeschool App

This document provides step-by-step instructions for deploying the homeschool app to Vercel and configuring the atozfamily.org domain.

## Prerequisites

Before deploying, ensure you have:

1. A Vercel account (https://vercel.com)
2. Access to your domain registrar for atozfamily.org
3. A PostgreSQL database (we recommend using Vercel Postgres or Supabase)

## Environment Variables

The following environment variables must be set in your Vercel project:

- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: A secure random string for NextAuth.js (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Set to https://atozfamily.org

## Deployment Steps

### 1. Push your code to GitHub

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 2. Connect to Vercel

1. Log in to your Vercel account
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Build Command: npm install --legacy-peer-deps && npm run build
   - Output Directory: .next
   - Install Command: npm install --legacy-peer-deps

### 3. Configure Environment Variables

1. In your Vercel project settings, go to "Environment Variables"
2. Add the required environment variables listed above

### 4. Deploy

1. Click "Deploy" to start the deployment process
2. Vercel will build and deploy your application
3. Once complete, you'll receive a preview URL (e.g., homeschool-app.vercel.app)

## Domain Configuration

### 1. Add Your Domain to Vercel

1. In your Vercel project, go to "Settings" > "Domains"
2. Enter "atozfamily.org" and click "Add"
3. Vercel will provide DNS configuration instructions

### 2. Configure DNS Records

At your domain registrar, add the following DNS records:

1. **A Record**:
   - Name: @
   - Value: 76.76.21.21
   - TTL: 3600 (or automatic)

2. **CNAME Record**:
   - Name: www
   - Value: cname.vercel-dns.com
   - TTL: 3600 (or automatic)

### 3. Verify Domain

1. Return to Vercel and wait for domain verification
2. This may take up to 48 hours, but typically completes within minutes

## Database Migration

Before your app is fully functional, you need to run the database migrations:

1. Install Vercel CLI: `npm install -g vercel`
2. Log in to Vercel CLI: `vercel login`
3. Link to your project: `vercel link`
4. Run the database migration: `vercel env pull && npx prisma migrate deploy`

## Testing Your Deployment

After deployment, verify that:

1. The application loads at https://atozfamily.org
2. User registration and login work correctly
3. All features (boards, resources, planners) function as expected
4. The application displays correctly on mobile devices

## Troubleshooting

If you encounter issues:

1. Check Vercel deployment logs for errors
2. Verify environment variables are set correctly
3. Ensure DNS records are properly configured
4. Check database connection and migrations

## Maintenance

To update your application:

1. Make changes to your code locally
2. Test thoroughly
3. Commit and push to GitHub
4. Vercel will automatically deploy the updates

## Support

If you need assistance with deployment, contact:
- Vercel Support: https://vercel.com/support
- Domain Registrar Support
- Database Provider Support
