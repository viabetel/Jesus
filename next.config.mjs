/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Expõe a fase do build pra que lib/env.ts saiba se está em build ou runtime
    NEXT_PHASE: process.env.NEXT_PHASE ?? "",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/d/**" },
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
    formats: ["image/avif", "image/webp"],
  },
}
export default nextConfig
