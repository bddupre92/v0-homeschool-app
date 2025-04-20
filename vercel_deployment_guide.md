# Vercel Deployment Instructions

## Overview

This document provides step-by-step instructions for deploying your homeschool app to Vercel with your atozfamily.org domain. All the necessary fixes have been implemented to address the deployment issues identified in the Vercel logs.

## Deployment Steps

### 1. Push Changes to GitHub

First, push all the changes to your GitHub repository:

```bash
cd /home/ubuntu/v0-homeschool-app
git add .
git commit -m "Fix deployment issues with env, path aliases, and Tailwind"
git push origin main
```

### 2. Deploy to Vercel

#### Option 1: Using Vercel Dashboard

1. Log in to your Vercel account at [vercel.com](https://vercel.com)
2. Go to your project or import it from GitHub if you haven't already
3. Under "Settings" > "General", ensure:
   - Framework Preset is set to Next.js
   - Build Command is set to `npm install && npm run build`
   - Output Directory is set to `.next`

4. Under "Settings" > "Environment Variables", add:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: A secure random string for authentication
   - `NEXTAUTH_URL`: https://atozfamily.org

5. Deploy your project by clicking "Redeploy" or by pushing new changes to GitHub

#### Option 2: Using Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   cd /home/ubuntu/v0-homeschool-app
   vercel
   ```

4. Follow the interactive prompts and ensure you set the required environment variables

### 3. Configure Your Domain

1. In the Vercel dashboard, go to your project
2. Navigate to "Settings" > "Domains"
3. Add your domain: atozfamily.org
4. Vercel will provide DNS records that you need to add to your domain registrar

#### DNS Configuration for atozfamily.org

Add these records at your domain registrar:
- Type: A, Name: @, Value: 76.76.21.21
- Type: CNAME, Name: www, Value: cname.vercel-dns.com

## Troubleshooting

If you encounter any issues during deployment:

1. **Check Build Logs**: Review the build logs in the Vercel dashboard for specific error messages

2. **Verify Environment Variables**: Ensure all required environment variables are set correctly

3. **Clear Build Cache**: In the Vercel dashboard, go to your project's "Settings" > "General" > "Build & Development Settings" and click "Clear Build Cache and Deploy"

4. **Check Database Connection**: Verify that your PostgreSQL database is accessible from Vercel's servers

## Implemented Fixes

The following fixes have been implemented to address the deployment issues:

1. **Fixed .env file**: Removed quotation marks from environment variables to prevent recursive reference errors

2. **Updated module resolution**: Created a proper next.config.js with webpack configuration for path aliases

3. **Fixed Tailwind CSS issues**: 
   - Moved Tailwind CSS from devDependencies to dependencies in package.json
   - Added tailwindcss-animate with specific version
   - Ensured all required Tailwind dependencies are properly installed

4. **Updated Vercel configuration**: Modified vercel.json to use standard npm install commands

These changes should resolve all the deployment issues identified in the Vercel logs.
