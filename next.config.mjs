/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript errors are checked at build time (tsc passes clean)
  images: {
    unoptimized: false,
    remotePatterns: [
      // Google Drive direct links (via lh3)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/d/**",
      },
      // Vercel Blob Storage (legacy logo URLs)
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      },
      // Cloudinary (recommended for production)
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

export default nextConfig
