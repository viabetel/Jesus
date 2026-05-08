"use client"

import { MessageCircle } from "lucide-react"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"

export function WhatsAppButton() {
  const message =
    "Olá! Vim pelo site da Fashion Store e gostaria de conhecer as camisetas disponíveis."

  return (
    <a
      href={createWhatsAppLink(WHATSAPP_NUMBER, message)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95 animate-pulse-whatsapp safe-bottom-6 right-4 sm:right-6"
      style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" />
    </a>
  )
}
