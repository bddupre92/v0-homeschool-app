# Domain Configuration for atozfamily.org

This document provides detailed instructions for configuring your atozfamily.org domain with Vercel to ensure proper connection to your homeschool application.

## DNS Configuration

### Step 1: Access Your Domain Registrar

1. Log in to the domain registrar where atozfamily.org is registered
2. Navigate to the DNS management or DNS settings section

### Step 2: Add Required DNS Records

Add the following DNS records to point your domain to Vercel:

#### A Records

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A    | @    | 76.76.21.21 | 3600 |

#### CNAME Records

| Type  | Name | Value               | TTL |
|-------|------|---------------------|-----|
| CNAME | www  | cname.vercel-dns.com | 3600 |

### Step 3: Verify Domain in Vercel

1. In your Vercel dashboard, go to your project
2. Navigate to Settings > Domains
3. Add your domain: atozfamily.org
4. Vercel will check if the DNS records are properly configured
5. Once verified, your domain will show as "Valid Configuration"

## SSL/TLS Certificate

Vercel automatically provisions and renews SSL certificates for your domain. No additional configuration is required for HTTPS.

## Domain Verification Troubleshooting

If domain verification fails:

1. **DNS Propagation**: DNS changes can take up to 48 hours to propagate globally. Wait and try again later.

2. **Record Verification**: Double-check that all DNS records match exactly what Vercel requires.

3. **CAA Records**: If your domain has CAA records, ensure they allow Vercel to issue certificates:
   ```
   CAA 0 issue "letsencrypt.org"
   ```

4. **Domain Registrar Cache**: Some registrars cache DNS records. Try clearing the cache if available.

## Subdomain Configuration (Optional)

If you want to use subdomains (e.g., app.atozfamily.org):

1. Add a CNAME record pointing to cname.vercel-dns.com
2. Add the subdomain in Vercel project settings

| Type  | Name | Value               | TTL |
|-------|------|---------------------|-----|
| CNAME | app  | cname.vercel-dns.com | 3600 |

## Custom Email Configuration (Optional)

If you want to set up custom email addresses with your domain (e.g., info@atozfamily.org):

1. Set up MX records according to your email provider's instructions
2. Add SPF, DKIM, and DMARC records as recommended by your email provider

## Domain Privacy and Security

1. Ensure WHOIS privacy protection is enabled at your registrar
2. Consider enabling Domain Lock to prevent unauthorized transfers

## Maintenance

1. Keep your domain registration current to avoid expiration
2. Periodically review DNS settings to ensure they remain correct
3. Monitor SSL certificate status in Vercel dashboard

## Support Resources

If you encounter issues with your domain configuration:

- Vercel Domains Documentation: https://vercel.com/docs/concepts/projects/domains
- Vercel Support: https://vercel.com/support
- Contact your domain registrar's support team

By following these instructions, your atozfamily.org domain will be properly configured to work with your Vercel-hosted homeschool application.
