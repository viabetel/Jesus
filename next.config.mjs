/** @type {import('next').NextConfig} */
const nextConfig = {
  // typescript.ignoreBuildErrors removido — preferimos descobrir e corrigir o erro real
  // se algum surgir no build. (Validado localmente com `tsc --noEmit`.)
  images: {
    unoptimized: false,
    remotePatterns: [
      // Google Drive — direct image links (lh3 gera /d/ID)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/d/**",
      },
      // Google Drive — thumbnails (drive.google.com/thumbnail?id=...)
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      // Vercel Blob Storage (legacy logo URLs)
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      },
      // Cloudinary (recomendado para produção)
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
