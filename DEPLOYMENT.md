# Vercel Deployment Guide for A to Z Family Homeschool App

This document provides instructions for deploying the A to Z Family Homeschool App to Vercel and configuring the atozfamily.org domain.

## Prerequisites

1. A Vercel account
2. Access to your domain registrar for atozfamily.org
3. A PostgreSQL database (can be set up on Vercel, Railway, Supabase, or other providers)

## Environment Variables

You'll need to set the following environment variables in your Vercel project:

```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_URL=https://atozfamily.org
NEXTAUTH_SECRET=your-secure-random-string
GOOGLE_CLIENT_ID=your-google-client-id (optional)
GOOGLE_CLIENT_SECRET=your-google-client-secret (optional)
```

## Deployment Steps

1. **Create a Vercel Project**:
   - Go to [Vercel](https://vercel.com) and sign in
   - Click "Add New" > "Project"
   - Import your GitHub repository (https://github.com/bddupre92/v0-homeschool-app)
   - Configure project settings

2. **Configure Environment Variables**:
   - In your project settings, go to "Environment Variables"
   - Add all the required variables listed above
   - Make sure to set the correct DATABASE_URL for your PostgreSQL database

3. **Deploy the Project**:
   - Click "Deploy" to start the deployment process
   - Vercel will automatically detect the Next.js framework and use the appropriate build settings

4. **Configure Custom Domain**:
   - In your project settings, go to "Domains"
   - Add your domain: atozfamily.org
   - Follow the instructions to configure DNS settings

## DNS Configuration for atozfamily.org

You'll need to add the following DNS records at your domain registrar:

1. **A Record**:
   - Name: @
   - Value: 76.76.21.21
   - TTL: 3600 (or default)

2. **CNAME Record**:
   - Name: www
   - Value: cname.vercel-dns.com.
   - TTL: 3600 (or default)

## Verifying Deployment

After deployment, verify that:

1. The application is accessible at https://atozfamily.org
2. User registration and login work correctly
3. All features (boards, resources, planners, etc.) function as expected
4. The database connection is working properly

## Troubleshooting

If you encounter issues:

1. Check Vercel deployment logs for errors
2. Verify environment variables are set correctly
3. Ensure DNS configuration is properly set up
4. Check database connection string and accessibility

## Ongoing Maintenance

For future updates:

1. Push changes to your GitHub repository
2. Vercel will automatically deploy new changes
3. Monitor deployment logs for any issues
