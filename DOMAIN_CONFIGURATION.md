# Domain Configuration Guide for atozfamily.org

This document provides detailed instructions for configuring the atozfamily.org domain with Vercel for your homeschool application.

## DNS Configuration

To connect your atozfamily.org domain to your Vercel deployment, you'll need to configure the following DNS records at your domain registrar:

### Required DNS Records

1. **A Record**:
   - Name: `@` (represents the root domain)
   - Value: `76.76.21.21` (Vercel's IP address)
   - TTL: `3600` (or default)

2. **CNAME Record**:
   - Name: `www`
   - Value: `cname.vercel-dns.com.` (include the trailing period)
   - TTL: `3600` (or default)

### Additional Recommended Records

3. **TXT Record for Domain Verification**:
   - Name: `@`
   - Value: Will be provided by Vercel during domain setup
   - TTL: `3600` (or default)

4. **MX Records** (if you plan to use email with this domain):
   - Configure according to your email provider's instructions

## Steps to Configure Domain in Vercel

1. **Log in to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your homeschool app project

2. **Add Domain**:
   - Navigate to "Settings" > "Domains"
   - Click "Add" and enter `atozfamily.org`
   - Click "Add"

3. **Verify Domain**:
   - Vercel will check if the domain is properly configured
   - If verification fails, Vercel will provide instructions for the required DNS records
   - Add these records at your domain registrar

4. **Configure HTTPS**:
   - Vercel automatically provisions SSL certificates for your domain
   - This process may take up to 24 hours to complete

## Troubleshooting Domain Configuration

If you encounter issues with your domain configuration:

1. **DNS Propagation**:
   - DNS changes can take up to 48 hours to propagate globally
   - Use [dnschecker.org](https://dnschecker.org) to verify your DNS records

2. **SSL Certificate Issues**:
   - If HTTPS isn't working, check the SSL certificate status in Vercel
   - Ensure your DNS records are correctly configured

3. **Domain Verification**:
   - If domain verification fails, double-check the TXT record
   - Ensure the A and CNAME records are correctly set

4. **Redirect Issues**:
   - If www.atozfamily.org doesn't redirect to atozfamily.org (or vice versa)
   - Check your redirect settings in Vercel

## Custom Domain Settings in Vercel

In your Vercel project settings, you can configure additional domain options:

1. **Redirect Behavior**:
   - Configure redirects from www to non-www (or vice versa)
   - Set up custom redirects for specific paths

2. **Domain Protection**:
   - Enable password protection for staging environments
   - Configure IP-based access restrictions

3. **Custom Headers**:
   - Set security headers like Content-Security-Policy
   - Configure caching headers for improved performance

## Testing Your Domain Configuration

After configuring your domain, verify that:

1. https://atozfamily.org loads your application
2. https://www.atozfamily.org redirects correctly
3. HTTPS works properly with a valid SSL certificate
4. All application features work as expected

## Ongoing Domain Management

For future domain management:

1. Keep your domain registration current (renew before expiration)
2. Monitor SSL certificate expiration (Vercel handles renewal automatically)
3. Regularly check domain health in Vercel dashboard
