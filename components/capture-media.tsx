"use client"

/**
 * Media renderers for Capture records. Photo and voice captures may be
 * inlined as dataUrls (< 100KB) or stored in IndexedDB via blobId.
 * This component resolves either shape to a display element, creating
 * and revoking object URLs correctly.
 */

import { useEffect, useState } from "react"
import { getBlobUrl } from "@/lib/blob-store"

export function useBlobUrl(blobId?: string): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!blobId) {
      setUrl(undefined)
      return
    }
    let alive = true
    let objectUrl: string | undefined
    getBlobUrl(blobId)
      .then((u) => {
        if (!alive) {
          if (u) URL.revokeObjectURL(u)
          return
        }
        objectUrl = u
        setUrl(u)
      })
      .catch(() => setUrl(undefined))

    return () => {
      alive = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [blobId])

  return url
}

export function CapturePhoto({
  dataUrl,
  blobId,
  alt = "",
  className,
}: {
  dataUrl?: string
  blobId?: string
  alt?: string
  className?: string
}) {
  const blobUrl = useBlobUrl(blobId)
  const src = dataUrl ?? blobUrl
  if (!src) {
    return (
      <div
        className={`rounded bg-white/5 ${className ?? ""}`}
        aria-label="Photo loading"
        role="img"
      />
    )
  }
  return <img src={src} alt={alt} className={className} />
}

export function CaptureAudio({
  dataUrl,
  blobId,
  className,
}: {
  dataUrl?: string
  blobId?: string
  className?: string
}) {
  const blobUrl = useBlobUrl(blobId)
  const src = dataUrl ?? blobUrl
  if (!src) return null
  return (
    <audio controls src={src} className={className} preload="metadata" />
  )
}
