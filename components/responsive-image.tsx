"use client"

"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

interface ResponsiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = "100vw",
  ...props
}: ResponsiveImageProps) {
  const [imageSrc, setImageSrc] = useState(src)

  useEffect(() => {
    // Check if we should use the optimized version
    if (src.startsWith("/") && !src.includes("/optimized/") && !src.includes("/placeholder.svg")) {
      const originalPath = src.startsWith("/") ? src.substring(1) : src
      const pathParts = originalPath.split("/")
      const filename = pathParts.pop() || ""
      const directory = pathParts.join("/")

      // Use WebP if supported
      const supportsWebP =
        typeof window !== "undefined" &&
        document.createElement("canvas").toDataURL("image/webp").indexOf("data:image/webp") === 0

      if (supportsWebP) {
        const webpPath = `/optimized/${directory}/${filename.split(".")[0]}.webp`
        setImageSrc(webpPath)
      }
    }
  }, [src])

  return (
    <Image
      src={imageSrc || "/placeholder.svg"}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      {...props}
    />
  )
}
