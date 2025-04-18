# Vercel Deployment Instructions for A to Z Family Homeschool App

This document provides step-by-step instructions for deploying the homeschool app to Vercel using the GitHub repository.

## Prerequisites

Before deploying to Vercel, ensure you have:

1. A Vercel account (create one at [vercel.com](https://vercel.com) if needed)
2. Access to the GitHub repository (https://github.com/bddupre92/v0-homeschool-app)
3. A PostgreSQL database set up (Vercel Postgres, Supabase, Railway, etc.)
4. Your atozfamily.org domain ready for configuration

## Deployment Steps

### 1. Connect Repository to Vercel

1. Log in to your Vercel account
2. Click "Add New" > "Project"
3. Select "Import Git Repository"
4. Choose the GitHub repository: bddupre92/v0-homeschool-app
5. If needed, grant Vercel permission to access your GitHub repositories

### 2. Configure Project Settings

1. **Project Name**: Enter a name for your project (e.g., "atoz-family-homeschool")
2. **Framework Preset**: Verify that "Next.js" is automatically selected
3. **Root Directory**: Leave as default (/)
4. **Build and Output Settings**: Leave as default

### 3. Configure Environment Variables

Add the following environment variables:

```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_URL=https://atozfamily.org
NEXTAUTH_SECRET=your-secure-random-string
```

Optional (for Google authentication):
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. Deploy the Application

1. Click "Deploy"
2. Wait for the build and deployment process to complete
3. Vercel will provide a temporary URL (e.g., atoz-family-homeschool.vercel.app)

### 5. Add Custom Domain

1. Go to "Settings" > "Domains"
2. Click "Add" and enter "atozfamily.org"
3. Follow the instructions to configure DNS settings (refer to DOMAIN_CONFIGURATION.md)
4. Wait for domain verification and SSL certificate provisioning

## Post-Deployment Tasks

### 1. Initialize Database

If this is your first deployment, you'll need to initialize the database:

1. Go to Vercel dashboard > "Deployments" > latest deployment
2. Click "Functions" tab
3. Find and click on any API route
4. This will trigger Prisma to create the database tables on first access

### 2. Test Application Functionality

Verify that all features work correctly:

1. User registration and login
2. Board creation and management
3. Resource management
4. Planner functionality
5. Lesson management

### 3. Monitor Application Performance

1. Check Vercel Analytics for performance metrics
2. Monitor error logs in the Vercel dashboard
3. Test application on different devices and browsers

## Continuous Deployment

The application is set up for continuous deployment:

1. Any changes pushed to the main branch will automatically trigger a new deployment
2. You can view deployment history in the Vercel dashboard
3. If needed, you can roll back to previous deployments

## Troubleshooting Deployment Issues

If you encounter issues during deployment:

1. Check build logs in the Vercel dashboard
2. Verify environment variables are correctly set
3. Ensure database connection is working
4. Check for any errors in the application logs

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Prisma with Vercel Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
