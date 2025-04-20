# Vercel Deployment Instructions for Homeschool App

This guide provides step-by-step instructions for deploying your homeschool app to Vercel and configuring your atozfamily.org domain.

## Prerequisites

- A Vercel account (create one at [vercel.com](https://vercel.com) if you don't have one)
- Access to your domain registrar's DNS settings for atozfamily.org
- Your GitHub repository with the homeschool app code

## Deployment Steps

### 1. Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
cd /home/ubuntu/v0-homeschool-app
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option 1: Deploy via Vercel Dashboard

1. Log in to your Vercel account at [vercel.com](https://vercel.com)
2. Click "Add New..." and select "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm install --legacy-peer-deps && npm run build
   - Output Directory: .next
5. Add Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: A secure random string for authentication
   - `NEXTAUTH_URL`: https://atozfamily.org
6. Click "Deploy"

#### Option 2: Deploy via Vercel CLI

1. Install the Vercel CLI (if not already installed):
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

4. Follow the interactive prompts:
   - Set up and deploy: Yes
   - Link to existing project or create new: Choose based on your situation
   - Environment variables: Set up DATABASE_URL, NEXTAUTH_SECRET, and NEXTAUTH_URL

### 3. Configure Your Domain

#### Add Your Domain in Vercel

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" > "Domains"
3. Add your domain: atozfamily.org
4. Vercel will provide DNS records that you need to add to your domain registrar

#### Update DNS Records at Your Domain Registrar

1. Log in to your domain registrar (where you purchased atozfamily.org)
2. Go to the DNS settings for atozfamily.org
3. Add the following records:
   - Type: A, Name: @, Value: 76.76.21.21
   - Type: CNAME, Name: www, Value: cname.vercel-dns.com

4. If you're using Vercel nameservers (optional but recommended):
   - Update nameservers to:
     - ns1.vercel-dns.com
     - ns2.vercel-dns.com

5. Wait for DNS propagation (can take up to 48 hours, but often much faster)

### 4. Verify Deployment

1. Once deployment is complete, Vercel will provide a URL (e.g., your-project.vercel.app)
2. Test this URL to ensure your application works correctly
3. After DNS propagation, test your custom domain (atozfamily.org)

## Troubleshooting

If you encounter deployment issues:

1. **Check Environment Variables**: Ensure all required environment variables are set correctly in the Vercel dashboard.

2. **Database Connection**: Verify that your PostgreSQL database is accessible from Vercel's servers and that the connection string is correct.

3. **Clear Build Cache**: In the Vercel dashboard, go to your project's "Settings" > "General" > "Build & Development Settings" and click "Clear Build Cache and Deploy".

4. **Check Build Logs**: Review the build logs in the Vercel dashboard for specific error messages.

5. **Node.js Version**: Ensure Vercel is using Node.js 18 or higher (as specified in your package.json).

## Maintaining Your Deployment

- **Automatic Deployments**: By default, Vercel will automatically deploy when you push changes to your GitHub repository.

- **Preview Deployments**: Vercel creates preview deployments for pull requests, allowing you to test changes before merging.

- **Environment Variables**: Update environment variables in the Vercel dashboard as needed.

- **Monitoring**: Use the Vercel dashboard to monitor your application's performance and logs.

## Next Steps After Deployment

1. Set up a proper production database (if you're currently using a local development database)
2. Configure proper authentication secrets for production
3. Set up monitoring and analytics
4. Consider implementing CI/CD workflows for testing before deployment
