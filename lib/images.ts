/**
 * Image helper for Fashion Store
 * Supports local images, remote public URLs, and Google Drive links.
 *
 * ⚠️ PRODUCTION NOTE:
 * Google Drive is NOT reliable for production image hosting.
 * For production, move images to one of these services:
 *   - /public folder (simplest, works with Vercel)
 *   - Vercel Blob Storage
 *   - Cloudinary
 *   - Supabase Storage
 *   - AWS S3 + CloudFront
 */

/**
 * Converts a Google Drive shareable link to a direct image URL.
 * Supports both /file/d/ID/view and ?id=ID formats.
 *
 * Example inputs:
 *   https://drive.google.com/file/d/ABC123/view?usp=sharing
 *   https://drive.google.com/open?id=ABC123
 *
 * Returns a direct link like:
 *   https://lh3.googleusercontent.com/d/ABC123
 */
export function googleDriveToDirectUrl(driveUrl: string): string | null {
  if (!driveUrl) return null

  // Pattern: /file/d/{ID}/
  const fileMatch = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) {
    return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`
  }

  // Pattern: ?id={ID} or &id={ID}
  const idMatch = driveUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (idMatch) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`
  }

  return null
}

/**
 * Resolves an image source to a usable URL.
 * Handles local paths, Google Drive links, and regular URLs.
 */
export function resolveImageSrc(src: string): string {
  if (!src) return "/brand/placeholder-product.svg"

  // Local path — use as-is
  if (src.startsWith("/")) return src

  // Google Drive link — convert to direct URL
  if (src.includes("drive.google.com")) {
    const directUrl = googleDriveToDirectUrl(src)
    return directUrl || "/brand/placeholder-product.svg"
  }

  // Regular URL — use as-is
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src
  }

  return "/brand/placeholder-product.svg"
}

/**
 * Check if image source is a remote URL
 */
export function isRemoteImage(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://")
}
