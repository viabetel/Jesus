"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle, AlertCircle, ArrowLeft, Check, X, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { useCart, type HydratedCartItem } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import {
  WHATSAPP_NUMBER, createWhatsAppLink, formatCartMessage,
} from "@/lib/whatsapp"
import { formatPrice } from "@/lib/format"
import { formatPhone, isValidPhone, isValidEmail } from "@/lib/phone"
import { toast } from "sonner"

export function CartContent() {
  const {
    items, refs, loading, revalidate,
    removeItem, updateQuantity, getSubtotal, clearCart,
  } = useCart()
  const { user, isAuthenticated, addOrder } = useAuth()

  const [customerName, setCustomerName] = useState("")
  const [customerWhatsapp, setCustomerWhatsapp] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [address, setAddress] = useState("")
  const [observation, setObservation] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [lastOrderNumber, setLastOrderNumber] = useState("")
  const [touched, setTouched] = useState({ name: false, whatsapp: false, email: false })
  const [submitting, setSubmitting] = useState(false)

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

  // Itens válidos (não removidos, com produto presente)
  const validItems = items.filter(i => !i.shouldRemove && i.product)

  const isFormValid = nameValid && phoneValid && emailValid && validItems.length > 0

  // Warnings globais (itens removidos ou ajustados)
  const globalWarnings = items
    .filter(i => i.warnings.length > 0)
    .flatMap(i => i.warnings)

  const handlePhoneChange = (value: string) => {
    setCustomerWhatsapp(formatPhone(value))
  }

  const handleFinalize = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      // Revalida antes de enviar (garante preço/estoque atualizado)
      const freshItems = await revalidate()
      const freshValid = freshItems.filter(i => !i.shouldRemove && i.product)

      if (freshValid.length === 0) {
        toast.error("Nenhum item válido na sacola.")
        setSubmitting(false)
        return
      }

      // Checa se algo mudou após revalidação
      const freshWarnings = freshItems.filter(i => i.warnings.length > 0).flatMap(i => i.warnings)
      if (freshWarnings.length > 0) {
        toast.error("Alguns itens foram atualizados. Revise antes de continuar.", {
          description: freshWarnings.slice(0, 3).join("; "),
        })
        setSubmitting(false)
        return
      }

      // Monta payload pro servidor
      const apiItems = freshValid.map(i => ({
        productId: i.ref.productId,
        variantSku: i.ref.variantSku,
        quantity: i.ref.quantity,
      }))

      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerWhatsapp,
          customerEmail,
          items: apiItems,
          address: address || undefined,
          observation: observation || undefined,
        }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string | { code?: string; message?: string; sku?: string; available?: number; requested?: number }
        }
        let msg = "Erro ao registrar pedido."
        const err = data.error
        if (typeof err === "object" && err !== null) {
          if (err.code === "INSUFFICIENT_STOCK") {
            msg = `Estoque insuficiente para ${err.sku}: disponível ${err.available}, pedido ${err.requested}.`
          } else if (err.code === "PRODUCT_NOT_FOUND" || err.code === "VARIANT_NOT_FOUND") {
            msg = "Um item não existe mais. Remova e tente novamente."
          } else if (err.message) {
            msg = err.message
          }
        } else if (typeof err === "string") {
          msg = err
        }
        toast.error(msg)
        setSubmitting(false)
        return
      }

      type ServerOrder = {
        id: string; number: string
        items: Array<{ productName: string; size: string; color: string; quantity: number; price: number }>
        total: number
      }
      const serverOrder = (await res.json()) as ServerOrder

      // Backup local
      addOrder({
        items: serverOrder.items.map(i => ({
          productName: i.productName, size: i.size, color: i.color, quantity: i.quantity, price: i.price,
        })),
        total: serverOrder.total,
        address: address || undefined,
        observation: observation || undefined,
      })

      setLastOrderNumber(serverOrder.number)

      // WhatsApp com dados do servidor
      const message = formatCartMessage(
        serverOrder.items.map(i => ({ name: i.productName, size: i.size, color: i.color, quantity: i.quantity, price: i.price })),
        { name: customerName, whatsapp: customerWhatsapp, email: customerEmail, address: address || undefined, observation: observation || undefined },
        serverOrder.total,
        serverOrder.number
      )
      window.open(createWhatsAppLink(WHATSAPP_NUMBER, message), "_blank")
      setShowConfirmDialog(true)
    } catch (err) {
      console.error(err)
      toast.error("Falha ao enviar pedido.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmSent = () => {
    clearCart()
    setShowConfirmDialog(false)
    toast.success("Pedido registrado!")
  }

  const handleNotSent = () => {
    setShowConfirmDialog(false)
    toast.info("Tudo bem! A sacola continua salva.")
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">Carregando sacola...</p>
      </div>
    )
  }

  // Empty state
  if (refs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h2 className="mt-6 font-serif text-2xl font-bold">Sacola vazia</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Adicione produtos à sua sacola e finalize pelo WhatsApp.
        </p>
        <Link href="/produtos" className="mt-8">
          <Button className="gap-2 rounded-full px-8"><ShoppingBag className="h-4 w-4" /> Ver produtos</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Warnings globais */}
      {globalWarnings.length > 0 && (
        <div className="mb-4 space-y-1">
          {globalWarnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-amber-300/50 bg-amber-50 p-2.5 text-[11px] text-amber-900">
              <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
              <span>{w}</span>
            </div>
          ))}
          <button
            onClick={() => revalidate()}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3 w-3" /> Revalidar sacola
          </button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <CartItemCard
              key={`${item.ref.productId}-${item.ref.variantSku}`}
              item={item}
              onRemove={() => removeItem(item.ref.productId, item.ref.variantSku)}
              onQuantityChange={(q) => updateQuantity(item.ref.productId, item.ref.variantSku, q)}
            />
          ))}

          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 pt-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Continuar comprando
          </Link>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
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

          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 font-serif text-lg font-semibold">Seus Dados</h2>
            {!isAuthenticated && (
              <p className="mb-4 text-xs text-muted-foreground">
                <Link href="/login" className="underline hover:text-foreground">Faça login</Link>{" "}
                para preencher automaticamente.
              </p>
            )}
            <div className="space-y-3.5">
              <div>
                <Label htmlFor="cart-name" className="text-xs">Nome *</Label>
                <Input id="cart-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, name: true }))} placeholder="Seu nome completo"
                  autoComplete="name" enterKeyHint="next" className="mt-1 h-11 text-base" />
                {touched.name && !nameValid && <p className="mt-1 text-[11px] text-destructive">Informe seu nome completo</p>}
              </div>
              <div>
                <Label htmlFor="cart-whatsapp" className="text-xs">WhatsApp *</Label>
                <Input id="cart-whatsapp" type="tel" inputMode="tel" value={customerWhatsapp}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, whatsapp: true }))}
                  placeholder="(32) 99999-9999" autoComplete="tel" enterKeyHint="next" maxLength={15}
                  className="mt-1 h-11 text-base" />
                {touched.whatsapp && !phoneValid && customerWhatsapp.length > 0 && (
                  <p className="mt-1 text-[11px] text-destructive">Informe um número válido com DDD</p>
                )}
              </div>
              <div>
                <Label htmlFor="cart-email" className="text-xs">E-mail *</Label>
                <Input id="cart-email" type="email" inputMode="email" value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  placeholder="seu@email.com" autoComplete="email" enterKeyHint="next"
                  className="mt-1 h-11 text-base" />
                {touched.email && !emailValid && customerEmail.length > 0 && (
                  <p className="mt-1 text-[11px] text-destructive">Informe um e-mail válido</p>
                )}
              </div>
              <div>
                <Label htmlFor="cart-address" className="text-xs">Endereço (opcional)</Label>
                <Textarea id="cart-address" value={address} onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, número, bairro, cidade..." autoComplete="street-address"
                  className="mt-1 text-base" rows={2} />
              </div>
              <div>
                <Label htmlFor="cart-obs" className="text-xs">Observação (opcional)</Label>
                <Textarea id="cart-obs" value={observation} onChange={(e) => setObservation(e.target.value)}
                  placeholder="Alguma observação sobre o pedido..." className="mt-1 text-base" rows={2} />
              </div>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full gap-2 rounded-xl bg-[#25D366] py-6 text-base font-semibold text-white hover:bg-[#1DA851] active:scale-[0.98] transition-transform touch-target"
            onClick={handleFinalize}
            disabled={!isFormValid || submitting}
          >
            <MessageCircle className="h-5 w-5" />
            {submitting ? "Enviando..." : "Finalizar pelo WhatsApp"}
          </Button>
        </div>
      </div>

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
            <Button className="flex-1 gap-2 bg-[#25D366] text-white hover:bg-[#1DA851] touch-target" onClick={handleConfirmSent}>
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

// ===== Subcomponente: card de item na sacola =====

function CartItemCard({
  item, onRemove, onQuantityChange,
}: {
  item: HydratedCartItem
  onRemove: () => void
  onQuantityChange: (q: number) => void
}) {
  const p = item.product
  const v = item.variant
  const qty = item.ref.quantity

  // Item inválido (removido, oculto, etc)
  if (item.shouldRemove || !p) {
    return (
      <div className="flex min-w-0 items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
        <div className="h-16 w-14 shrink-0 rounded-lg bg-red-100" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-red-800">Item indisponível</p>
          <p className="mt-0.5 text-[10px] text-red-600">{item.warnings.join(" ")}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-red-500" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 gap-3 rounded-xl border bg-card p-3 transition-shadow hover:shadow-sm sm:gap-4 sm:p-4">
      <Link
        href={`/produto/${p.slug}`}
        className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-32 sm:w-24"
      >
        <Image
          src={p.image || "/brand/placeholder-product.svg"}
          alt={p.name}
          fill
          className="object-cover"
          sizes="96px"
          unoptimized={p.image?.includes("drive.google.com")}
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/produto/${p.slug}`}
            className="line-clamp-2 break-words font-serif text-sm font-semibold leading-snug transition-colors hover:text-muted-foreground sm:text-[15px]"
          >
            {p.name}
          </Link>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:mt-1 sm:text-xs">
            {v ? `Tam: ${v.size} · ${v.colorName}` : item.ref.variantSku}
          </p>
          <p className="mt-1 text-sm font-semibold sm:hidden">
            {formatPrice(p.price * qty)}
          </p>
          {/* Warnings por item */}
          {item.warnings.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {item.warnings.map((w, i) => (
                <p key={i} className="text-[10px] text-amber-700">{w}</p>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="icon"
              className="h-8 w-8 shrink-0 rounded-full sm:h-9 sm:w-9"
              onClick={() => onQuantityChange(qty - 1)}
              aria-label="Diminuir"
            >
              <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
            <span className="min-w-[24px] text-center text-sm font-medium">{qty}</span>
            <Button
              variant="outline" size="icon"
              className="h-8 w-8 shrink-0 rounded-full sm:h-9 sm:w-9"
              onClick={() => onQuantityChange(qty + 1)}
              disabled={qty >= item.maxQuantity}
              aria-label="Aumentar"
            >
              <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm font-semibold sm:inline">
              {formatPrice(p.price * qty)}
            </span>
            <Button
              variant="ghost" size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive sm:h-9 sm:w-9"
              onClick={onRemove}
              aria-label="Remover"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
