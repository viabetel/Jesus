"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle, AlertCircle, ArrowLeft, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import {
  WHATSAPP_NUMBER,
  createWhatsAppLink,
  formatCartMessage,
} from "@/lib/whatsapp"
import { formatPrice } from "@/lib/format"
import { formatPhone, isValidPhone, isValidEmail } from "@/lib/phone"

export function CartContent() {
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCart()
  const { user, isAuthenticated, addOrder } = useAuth()

  const [customerName, setCustomerName] = useState("")
  const [customerWhatsapp, setCustomerWhatsapp] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [address, setAddress] = useState("")
  const [observation, setObservation] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [lastOrderNumber, setLastOrderNumber] = useState("")
  const [touched, setTouched] = useState({ name: false, whatsapp: false, email: false })

  // Populate from user data
  useEffect(() => {
    if (user) {
      setCustomerName((prev) => prev || user.name || "")
      setCustomerWhatsapp((prev) => prev || (user.whatsapp ? formatPhone(user.whatsapp) : ""))
      setCustomerEmail((prev) => prev || user.email || "")
      setAddress((prev) => prev || user.address || "")
    }
  }, [user])

  const subtotal = getSubtotal()

  const nameValid = customerName.trim().length >= 2
  const phoneValid = isValidPhone(customerWhatsapp)
  const emailValid = isValidEmail(customerEmail)
  const isFormValid = nameValid && phoneValid && emailValid

  const handlePhoneChange = (value: string) => {
    setCustomerWhatsapp(formatPhone(value))
  }

  const handleFinalize = () => {
    const cartItems = items.map((item) => ({
      name: item.product.name,
      size: item.size,
      color: item.color.name,
      quantity: item.quantity,
      price: item.product.price,
    }))

    const order = addOrder({
      items: cartItems.map((item) => ({
        productName: item.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
      })),
      total: subtotal,
      address: address || undefined,
      observation: observation || undefined,
    })

    setLastOrderNumber(order.orderNumber)

    const message = formatCartMessage(
      cartItems,
      {
        name: customerName,
        whatsapp: customerWhatsapp,
        email: customerEmail,
        address: address || undefined,
        observation: observation || undefined,
      },
      subtotal,
      order.orderNumber
    )

    window.open(createWhatsAppLink(WHATSAPP_NUMBER, message), "_blank")
    setShowConfirmDialog(true)
  }

  const handleConfirmSent = () => {
    clearCart()
    setShowConfirmDialog(false)
  }

  const handleNotSent = () => {
    setShowConfirmDialog(false)
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/60">
          <ShoppingBag className="h-9 w-9 text-muted-foreground/60" />
        </div>
        <h2 className="mt-6 font-serif text-xl font-semibold">Sua sacola está vazia</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Adicione produtos à sua sacola e finalize pelo WhatsApp.
        </p>
        <Link href="/produtos" className="mt-8">
          <Button className="gap-2 rounded-full px-8">
            <ShoppingBag className="h-4 w-4" /> Ver produtos
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={`${item.product.id}-${item.size}-${item.color.name}`}
              className="flex gap-4 rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm"
            >
              <Link
                href={`/produto/${item.product.slug}`}
                className="relative h-28 w-22 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-32 sm:w-24"
              >
                <Image
                  src={item.product.images[0] || "/brand/placeholder-product.svg"}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/produto/${item.product.slug}`}
                    className="font-serif text-[15px] font-semibold leading-snug transition-colors hover:text-muted-foreground"
                  >
                    {item.product.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tamanho: {item.size} · Cor: {item.color.name}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  {/* Quantity — min 44px touch targets */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-full touch-target"
                      onClick={() =>
                        updateQuantity(item.product.id, item.size, item.color.name, item.quantity - 1)
                      }
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="min-w-[28px] text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-full touch-target"
                      onClick={() =>
                        updateQuantity(item.product.id, item.size, item.color.name, item.quantity + 1)
                      }
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive touch-target"
                      onClick={() => removeItem(item.product.id, item.size, item.color.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 pt-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Continuar comprando
          </Link>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Summary */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-serif text-lg font-semibold">Resumo do Pedido</h2>
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <span className="text-sm font-medium text-muted-foreground">Subtotal estimado</span>
              <span className="text-xl font-bold">{formatPrice(subtotal)}</span>
            </div>
            <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-muted/50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                O pagamento não é feito pelo site. Disponibilidade, forma de
                pagamento e entrega são confirmadas pelo WhatsApp.
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 font-serif text-lg font-semibold">Seus Dados</h2>

            {!isAuthenticated && (
              <p className="mb-4 text-xs text-muted-foreground">
                <Link href="/login" className="underline hover:text-foreground">
                  Faça login
                </Link>{" "}
                para preencher automaticamente.
              </p>
            )}

            <div className="space-y-3.5">
              {/* Nome */}
              <div>
                <Label htmlFor="cart-name" className="text-xs">Nome *</Label>
                <Input
                  id="cart-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  enterKeyHint="next"
                  className="mt-1 h-11 text-base"
                />
                {touched.name && !nameValid && (
                  <p className="mt-1 text-[11px] text-destructive">Informe seu nome completo</p>
                )}
              </div>

              {/* WhatsApp — with mask */}
              <div>
                <Label htmlFor="cart-whatsapp" className="text-xs">WhatsApp *</Label>
                <Input
                  id="cart-whatsapp"
                  type="tel"
                  inputMode="tel"
                  value={customerWhatsapp}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, whatsapp: true }))}
                  placeholder="(32) 99999-9999"
                  autoComplete="tel"
                  enterKeyHint="next"
                  maxLength={15}
                  className="mt-1 h-11 text-base"
                />
                {touched.whatsapp && !phoneValid && customerWhatsapp.length > 0 && (
                  <p className="mt-1 text-[11px] text-destructive">Informe um número válido com DDD</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="cart-email" className="text-xs">E-mail *</Label>
                <Input
                  id="cart-email"
                  type="email"
                  inputMode="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  enterKeyHint="next"
                  className="mt-1 h-11 text-base"
                />
                {touched.email && !emailValid && customerEmail.length > 0 && (
                  <p className="mt-1 text-[11px] text-destructive">Informe um e-mail válido</p>
                )}
              </div>

              {/* Endereço */}
              <div>
                <Label htmlFor="cart-address" className="text-xs">Endereço (opcional)</Label>
                <Textarea
                  id="cart-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, número, bairro, cidade..."
                  autoComplete="street-address"
                  className="mt-1 text-base"
                  rows={2}
                />
              </div>

              {/* Observação */}
              <div>
                <Label htmlFor="cart-obs" className="text-xs">Observação (opcional)</Label>
                <Textarea
                  id="cart-obs"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Alguma observação sobre o pedido..."
                  className="mt-1 text-base"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Finalize Button */}
          <Button
            size="lg"
            className="w-full gap-2 rounded-xl bg-[#25D366] py-6 text-base font-semibold text-white hover:bg-[#1DA851] active:scale-[0.98] transition-transform touch-target"
            onClick={handleFinalize}
            disabled={!isFormValid}
          >
            <MessageCircle className="h-5 w-5" />
            Finalizar pelo WhatsApp
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="mx-4 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Pedido enviado?</DialogTitle>
            <DialogDescription className="text-sm">
              O WhatsApp foi aberto com o pedido <strong>{lastOrderNumber}</strong>.
              Confirme se a mensagem foi enviada com sucesso.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1 gap-2 bg-[#25D366] text-white hover:bg-[#1DA851] touch-target"
              onClick={handleConfirmSent}
            >
              <Check className="h-4 w-4" /> Sim, enviei!
            </Button>
            <Button variant="outline" className="flex-1 gap-2 touch-target" onClick={handleNotSent}>
              <X className="h-4 w-4" /> Ainda não enviei
            </Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Se confirmar, sua sacola será limpa e o pedido ficará no seu histórico.
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
