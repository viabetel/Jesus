
import Image from "next/image"
import { Home, ShoppingBag, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-center">
      <a href="/" className="mb-8">
        <Image
          src="/brand/logo-dark.png"
          alt="Fashion Store"
          width={80}
          height={80}
          className="h-20 w-20"
        />
      </a>

      <h1 className="font-serif text-6xl font-bold text-primary lg:text-8xl">
        404
      </h1>

      <h2 className="mt-4 font-serif text-2xl font-bold lg:text-3xl">
        Página não encontrada
      </h2>

      <p className="mt-4 max-w-md text-muted-foreground">
        A página que você está procurando não existe ou foi movida. Mas não se
        preocupe, você pode voltar para a loja ou falar com a gente.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a href="/">
          <Button variant="outline" className="w-full gap-2 sm:w-auto">
            <Home className="h-4 w-4" />
            Voltar ao início
          </Button>
        </a>
        <a href="/produtos">
          <Button className="w-full gap-2 sm:w-auto">
            <ShoppingBag className="h-4 w-4" />
            Ver produtos
          </Button>
        </a>
      </div>

      <a
        href={createWhatsAppLink(
          WHATSAPP_NUMBER,
          "Olá! Vim pelo site da Fashion Store e preciso de ajuda."
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6"
      >
        <Button
          variant="ghost"
          className="gap-2 text-[#25D366] hover:text-[#128C7E]"
        >
          <MessageCircle className="h-4 w-4" />
          Precisa de ajuda? Fale no WhatsApp
        </Button>
      </a>
    </div>
  )
}
