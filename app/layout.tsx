import type { Metadata, Viewport } from "next"
import "./globals.css"
import { CartProvider } from "@/contexts/cart-context"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { AuthProvider } from "@/contexts/auth-context"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: {
    default: "Fashion Store | Camisetas Cristãs Online",
    template: "%s | Fashion Store",
  },
  description: "Camisetas cristãs com estilo, qualidade e propósito. Loja online de Juiz de Fora/MG com atendimento pelo WhatsApp.",
  keywords: "camisetas cristãs, moda cristã, loja cristã online, camisetas gospel, Fashion Store, Juiz de Fora",
  openGraph: {
    title: "Fashion Store | Camisetas Cristãs Online",
    description: "Camisetas cristãs com estilo, qualidade e propósito. Loja online de Juiz de Fora/MG.",
    type: "website",
    locale: "pt_BR",
    siteName: "Fashion Store",
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground overflow-x-hidden">
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              {children}
              <WhatsAppButton />
              <Toaster position="top-center" />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
