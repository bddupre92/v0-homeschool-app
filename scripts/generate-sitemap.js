const fs = require("fs")
const path = require("path")
const glob = require("glob")

// Configuration
const baseUrl = "https://homescholar.vercel.app" // Replace with your actual domain
const outputPath = "public/sitemap.xml"
const ignorePaths = [
  "app/api/**/*",
  "app/admin/**/*",
  "app/**/loading.tsx",
  "app/**/error.tsx",
  "app/layout.tsx",
  "app/not-found.tsx",
]

// Find all page files
const pageFiles = glob.sync("app/**/page.tsx", {
  ignore: ignorePaths,
})

console.log(`Found ${pageFiles.length} pages to include in sitemap`)

// Generate sitemap
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pageFiles
    .map((file) => {
      // Convert file path to URL path
      let urlPath = file
        .replace("app/", "/")
        .replace("/page.tsx", "")
        .replace(/\/\[(.+)\]/g, "/:$1") // Convert [param] to :param for display

      // Handle index routes
      if (urlPath === "/") {
        urlPath = ""
      }

      // Skip dynamic routes for simplicity
      if (urlPath.includes(":")) {
        return ""
      }

      return `
  <url>
    <loc>${baseUrl}${urlPath}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    })
    .filter(Boolean)
    .join("")}
</urlset>`

// Write sitemap to file
fs.writeFileSync(outputPath, sitemap)
console.log(`Sitemap generated at ${outputPath}`)
