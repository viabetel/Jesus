"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  MessageCircle,
  Mail,
  Instagram,
  MapPin,
  Clock,
  Send,
} from "lucide-react"
import {
  WHATSAPP_NUMBER,
  WHATSAPP_DISPLAY,
  STORE_INSTAGRAM,
  STORE_INSTAGRAM_URL,
  STORE_EMAIL,
  createWhatsAppLink,
} from "@/lib/whatsapp"
import { toast } from "sonner"

const contactInfo = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: WHATSAPP_DISPLAY,
    href: createWhatsAppLink(
      WHATSAPP_NUMBER,
      "Olá! Vim pelo site da Fashion Store e gostaria de informações."
    ),
    color: "bg-[#25D366]",
  },
  {
    icon: Mail,
    label: "E-mail",
    value: "diasygor312@gmail.com",
    href: "mailto:diasygor312@gmail.com",
    color: "bg-primary",
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: STORE_INSTAGRAM,
    href: STORE_INSTAGRAM_URL,
    color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500",
  },
  {
    icon: MapPin,
    label: "Localização",
    value: "Juiz de Fora, MG",
    color: "bg-muted",
    textColor: "text-muted-foreground",
  },
]

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const whatsappMessage = `Olá! Vim pelo formulário de contato do site da Fashion Store.

Nome: ${name}
E-mail: ${email}

Mensagem:
${message}`

    window.open(
      createWhatsAppLink(WHATSAPP_NUMBER, whatsappMessage),
      "_blank"
    )

    toast.success("Redirecionando para o WhatsApp...")
    setName("")
    setEmail("")
    setMessage("")
  }

  return (
    <>
      <Header />
      <main className="min-h-dvh py-8 lg:py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h1 className="font-serif text-3xl font-bold lg:text-4xl">
              Contato
            </h1>
            <p className="mt-3 text-muted-foreground">
              Fale com a Fashion Store pelo WhatsApp ou preencha o formulário
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h2 className="mb-6 font-serif text-lg font-semibold">
                  Canais de Atendimento
                </h2>

                <div className="space-y-4">
                  {contactInfo.map((item) => {
                    const Icon = item.icon
                    const Wrapper = item.href ? "a" : "div"
                    const wrapperProps = item.href
                      ? {
                          href: item.href,
                          target: "_blank",
                          rel: "noopener noreferrer",
                        }
                      : {}

                    return (
                      <Wrapper
                        key={item.label}
                        {...wrapperProps}
                        className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
                          item.href ? "hover:bg-muted" : ""
                        }`}
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full ${item.color} ${
                            item.textColor || "text-white"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {item.label}
                          </p>
                          <p className="font-medium">{item.value}</p>
                        </div>
                      </Wrapper>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Atendimento</p>
                    <p className="text-sm text-muted-foreground">
                      Pelo WhatsApp, em horário comercial
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-md bg-muted p-4 text-sm text-muted-foreground">
                  Pedidos, entregas e pagamentos são confirmados diretamente
                  pelo WhatsApp.
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href={createWhatsAppLink(
                  WHATSAPP_NUMBER,
                  "Olá! Vim pelo site da Fashion Store e gostaria de informações."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  size="lg"
                  className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#128C7E]"
                >
                  <MessageCircle className="h-5 w-5" />
                  Falar no WhatsApp
                </Button>
              </a>
            </div>

            {/* Contact Form */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-6 font-serif text-lg font-semibold">
                Envie uma Mensagem
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome" autoComplete="name" enterKeyHint="next" className="mt-1 h-11 text-base"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com" autoComplete="email" inputMode="email" enterKeyHint="next" className="mt-1 h-11 text-base"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escreva sua mensagem..."
                    className="mt-1"
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full gap-2">
                  <Send className="h-4 w-4" />
                  Enviar pelo WhatsApp
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Ao enviar, você será redirecionado para o WhatsApp da Fashion
                Store.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
