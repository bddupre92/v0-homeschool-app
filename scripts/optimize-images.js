const sharp = require("sharp")
const fs = require("fs")
const path = require("path")
const glob = require("glob")

// Configuration
const inputDir = "public"
const outputDir = "public/optimized"
const sizes = [640, 768, 1024, 1280, 1536] // Responsive sizes
const quality = 80

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Find all image files
const imageFiles = glob.sync(`${inputDir}/**/*.{jpg,jpeg,png}`, {
  ignore: [`${outputDir}/**/*`],
})

console.log(`Found ${imageFiles.length} images to optimize`)

// Process each image
;(async () => {
  for (const file of imageFiles) {
    const filename = path.basename(file)
    const relativePath = path.relative(inputDir, path.dirname(file))
    const outputPath = path.join(outputDir, relativePath)

    // Create output subdirectory if needed
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true })
    }

    try {
      // Create WebP version
      await sharp(file)
        .webp({ quality })
        .toFile(path.join(outputPath, `${path.parse(filename).name}.webp`))

      // Create responsive versions
      for (const size of sizes) {
        await sharp(file)
          .resize(size, null, { withoutEnlargement: true })
          .webp({ quality })
          .toFile(path.join(outputPath, `${path.parse(filename).name}-${size}.webp`))
      }

      console.log(`✓ Optimized: ${file}`)
    } catch (error) {
      console.error(`✗ Error optimizing ${file}:`, error)
    }
  }

  console.log("Image optimization complete!")
})()
