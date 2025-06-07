// Generate sitemap for the homeschool app
console.log("Generating sitemap...")

const baseUrl = "https://your-homeschool-app.vercel.app"

// Define all the routes in your app
const routes = [
  "/",
  "/about",
  "/dashboard",
  "/boards",
  "/boards/create",
  "/resources",
  "/planner",
  "/search",
  "/scroll",
  "/community",
  "/community/events",
  "/community/groups",
  "/community/locations",
  "/profile",
  "/settings",
  "/sign-in",
  "/sign-up",
  "/privacy-policy",
  "/terms-of-service",
]

// Generate sitemap XML
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === "/" ? "1.0" : "0.8"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`

console.log("Generated sitemap.xml:")
console.log(sitemap)

console.log("\nTo use this sitemap:")
console.log("1. Copy the XML content above")
console.log("2. Save it as 'public/sitemap.xml' in your project")
console.log("3. Submit the sitemap to Google Search Console")
console.log("4. Add the sitemap URL to your robots.txt file")

// Also generate robots.txt content
const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`

console.log("\nGenerated robots.txt:")
console.log(robotsTxt)
