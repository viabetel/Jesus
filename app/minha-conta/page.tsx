"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Loader2, Package, LogOut, AlertCircle, MessageCircle, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen"
import { statusLabel, statusBadgeClass, OrderStatusTimeline } from "@/components/order-status"
import { useFavorites } from "@/contexts/favorites-context"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"
import { formatPrice } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function MinhaContaPage() {
  const { user, orders, isAuthenticated, isHydrated, updateUser, logout, refreshOrders, ordersLoading, ordersError } = useAuth()
  const { favorites } = useFavorites()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", whatsapp: "", address: "", preferredSize: "" })
  const [redirecting, setRedirecting] = useState(false)
  const [activeTab, setActiveTab] = useState("dados")

  // Read tab from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get("tab")
    if (tab === "pedidos" || tab === "favoritos") setActiveTab(tab)
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      setRedirecting(true)
      window.location.replace("/login?next=/minha-conta")
    }
    if (user) {
      setFormData({
        name: user.name || "", email: user.email || "",
        whatsapp: user.whatsapp || "", address: user.address || "",
        preferredSize: user.preferredSize || "",
      })
    }
  }, [isAuthenticated, isHydrated, user])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    window.history.replaceState(null, "", tab === "dados" ? "/minha-conta" : `/minha-conta?tab=${tab}`)
  }

  const handleSave = async () => {
    const result = await updateUser(formData)
    if (result.ok) { setIsEditing(false); toast.success("Dados atualizados!") }
    else toast.error(result.error || "Erro ao salvar.")
  }

  const handleLogout = async () => { await logout(); window.location.assign("/") }

  if (!isHydrated || redirecting || !user) {
    return <AuthLoadingScreen message={redirecting ? "Redirecionando..." : "Carregando sua conta..."} />
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 bg-white border-b border-[var(--border)]">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 h-14 sm:px-6">
          <a href="/" className="font-serif text-lg font-bold">Fashion Store</a>
          <Button variant="outline" size="sm" className="gap-2 rounded-full text-[11px]" onClick={handleLogout}>
            <LogOut className="h-3.5 w-3.5" /> Sair
          </Button>
        </div>
      </div>

      <main className="min-h-dvh pt-20 pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">Minha Conta</h1>
          <p className="mt-1 text-[13px] text-[var(--muted-foreground)]">Olá, {user.name || user.email}</p>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="pedidos">Pedidos{orders.length > 0 && ` (${orders.length})`}</TabsTrigger>
              <TabsTrigger value="favoritos">Favoritos{favorites.length > 0 && ` (${favorites.length})`}</TabsTrigger>
            </TabsList>

            {/* ═══ DADOS ═══ */}
            <TabsContent value="dados" className="mt-6">
              <div className="rounded-xl border bg-card p-6 max-w-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-lg font-semibold">Dados pessoais</h2>
                  {!isEditing && <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Editar</Button>}
                </div>
                <div className="space-y-3">
                  <div><Label>Nome</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={!isEditing} className="mt-1" /></div>
                  <div><Label>E-mail <span className="text-xs text-muted-foreground">(não editável)</span></Label><Input value={formData.email} disabled className="mt-1 opacity-60" /></div>
                  <div><Label>WhatsApp</Label><Input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} disabled={!isEditing} className="mt-1" /></div>
                  <div><Label>Endereço</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} disabled={!isEditing} className="mt-1" /></div>
                  <div><Label>Tamanho preferido</Label><Input value={formData.preferredSize} onChange={e => setFormData({...formData, preferredSize: e.target.value})} disabled={!isEditing} className="mt-1" /></div>
                  {isEditing && (
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSave}>Salvar</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* ═══ PEDIDOS ═══ */}
            <TabsContent value="pedidos" className="mt-6">
              {ordersLoading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-[var(--muted-foreground)]">
                  <Loader2 className="h-4 w-4 animate-spin" /> Carregando pedidos...
                </div>
              ) : ordersError ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <AlertCircle className="h-10 w-10 text-red-400" />
                  <p className="text-sm text-red-500">{ordersError}</p>
                  <Button variant="outline" size="sm" onClick={refreshOrders}>Tentar novamente</Button>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <Package className="h-12 w-12 text-[var(--muted-foreground)] opacity-40" />
                  <p className="text-sm text-[var(--muted-foreground)]">Nenhum pedido ainda.</p>
                  <p className="text-[12px] text-[var(--muted-foreground)] max-w-xs">Quando você finalizar um pedido pelo site, ele aparecerá aqui.</p>
                  <a href="/produtos" className="mt-2 text-[12px] font-semibold text-[var(--ink)] underline underline-offset-2">Ver catálogo</a>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="rounded-xl border bg-card p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[14px] font-bold">{order.orderNumber}</p>
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusBadgeClass(order.status)}`}>
                              {statusLabel(order.status)}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                            {new Date(order.date).toLocaleDateString("pt-BR")} · {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                          </p>
                        </div>
                        <p className="text-[16px] font-bold shrink-0">{formatPrice(order.total)}</p>
                      </div>

                      {/* Mini preview of first 2 items */}
                      <div className="flex gap-2 mb-3">
                        {order.items.slice(0, 2).map((it, i) => (
                          <div key={i} className="flex items-center gap-2 text-[11px] text-[var(--muted-foreground)]">
                            <div className="h-8 w-8 bg-[var(--stone)] rounded overflow-hidden shrink-0">
                              {it.productImage && <Image src={it.productImage} alt="" width={32} height={32} className="object-cover h-full w-full" />}
                            </div>
                            <span className="truncate max-w-[120px]">{it.productName}</span>
                          </div>
                        ))}
                        {order.items.length > 2 && <span className="text-[10px] text-[var(--muted-foreground)] self-center">+{order.items.length - 2}</span>}
                      </div>

                      <OrderStatusTimeline status={order.status} />

                      <div className="flex gap-2 mt-3 flex-wrap">
                        <a href={`/minha-conta/pedidos/${order.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-[11px] font-medium hover:bg-[var(--cream)] transition">
                          Ver detalhes <ChevronRight className="h-3 w-3" />
                        </a>
                        <a href={createWhatsAppLink(WHATSAPP_NUMBER, `Olá! Sobre meu pedido ${order.orderNumber}...`)}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#1DA851] transition">
                          <MessageCircle className="h-3 w-3" /> WhatsApp
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ═══ FAVORITOS ═══ */}
            <TabsContent value="favoritos" className="mt-6">
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <p className="text-sm text-[var(--muted-foreground)]">Nenhum favorito salvo.</p>
                  <a href="/produtos" className="text-[12px] font-semibold text-[var(--ink)] underline underline-offset-2">Ver catálogo</a>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {favorites.map(p => (
                    <a key={p.id} href={`/produto/${p.slug}`} className="group rounded-lg border bg-card overflow-hidden hover:shadow-md transition">
                      <div className="relative aspect-[3/4] bg-[var(--stone)]">
                        {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="200px" />}
                      </div>
                      <div className="p-2.5">
                        <p className="text-[12px] font-medium truncate">{p.name}</p>
                        <p className="text-[13px] font-bold mt-0.5">{formatPrice(p.price)}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  )
}
