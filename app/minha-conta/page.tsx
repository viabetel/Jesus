"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  User,
  Heart,
  ShoppingBag,
  LogOut,
  Package,
  Edit,
  Save,
  X,
  MessageCircle,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useFavorites } from "@/contexts/favorites-context"
import { ProductCard } from "@/components/product-card"
import { formatPrice, formatDateBR } from "@/lib/format"
import { formatPhone } from "@/lib/phone"
import { WHATSAPP_NUMBER, createWhatsAppLink, formatResendMessage } from "@/lib/whatsapp"
import { toast } from "sonner"

export default function AccountPage() {
  const { user, orders, isAuthenticated, isHydrated, updateUser, logout } = useAuth()
  const { favorites } = useFavorites()
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    address: "",
    preferredSize: "",
  })

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push("/login")
      return
    }
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        whatsapp: user.whatsapp || "",
        address: user.address || "",
        preferredSize: user.preferredSize || "",
      })
    }
  }, [isAuthenticated, isHydrated, user, router])

  const handleSave = () => {
    updateUser(formData)
    setIsEditing(false)
    toast.success("Dados atualizados com sucesso!")
  }

  const handleLogout = () => {
    logout()
    router.push("/")
    toast.success("Você saiu da sua conta")
  }

  const handleResendOrder = (order: typeof orders[0]) => {
    const message = formatResendMessage(order.orderNumber, order.items, order.total)
    window.open(createWhatsAppLink(WHATSAPP_NUMBER, message), "_blank")
    toast.success("WhatsApp aberto para reenvio!")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Entregue": return "bg-emerald-100 text-emerald-800"
      case "Confirmado": return "bg-blue-100 text-blue-800"
      case "Cancelado": return "bg-red-100 text-red-800"
      case "Em confirmação": return "bg-amber-100 text-amber-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (!isHydrated || !isAuthenticated || !user) {
    return (
      <>
        <Header />
        <main className="flex min-h-dvh items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-dvh py-8 lg:py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-serif text-3xl font-bold">Minha Conta</h1>
              <p className="mt-1 text-muted-foreground">
                Olá, {user.name.split(" ")[0]}!
              </p>
            </div>
            <Button variant="outline" className="gap-2 rounded-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>

          <Tabs defaultValue="dados" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Meus Dados</span>
              </TabsTrigger>
              <TabsTrigger value="pedidos" className="gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Pedidos</span>
              </TabsTrigger>
              <TabsTrigger value="favoritos" className="gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Favoritos</span>
              </TabsTrigger>
            </TabsList>

            {/* User Data Tab */}
            <TabsContent value="dados">
              <div className="rounded-xl border bg-card p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-serif text-lg font-semibold">Informações Pessoais</h2>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                        <X className="mr-1 h-4 w-4" /> Cancelar
                      </Button>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="mr-1 h-4 w-4" /> Salvar
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="mr-1 h-4 w-4" /> Editar
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input id="acct-name" autoComplete="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={!isEditing} className="mt-1 h-11 text-base" />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="acct-email" type="email" inputMode="email" autoComplete="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={!isEditing} className="mt-1 h-11 text-base" />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input id="acct-whatsapp" type="tel" inputMode="tel" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: formatPhone(e.target.value) })} disabled={!isEditing} autoComplete="tel" maxLength={15} className="mt-1 h-11 text-base" />
                  </div>
                  <div>
                    <Label htmlFor="preferredSize">Tamanho preferido</Label>
                    <Select value={formData.preferredSize} onValueChange={(value) => setFormData({ ...formData, preferredSize: value })} disabled={!isEditing}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="P">P</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="G">G</SelectItem>
                        <SelectItem value="GG">GG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} disabled={!isEditing} className="mt-1" rows={3} placeholder="Rua, número, bairro, cidade..." />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="pedidos">
              <div className="rounded-xl border bg-card p-6">
                <h2 className="mb-6 font-serif text-lg font-semibold">Meus Pedidos</h2>

                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="rounded-xl border bg-background p-5">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-serif font-semibold">{order.orderNumber}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {formatDateBR(order.date)}
                            </p>
                          </div>
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.productName} ({item.size}, {item.color}) x{item.quantity}
                              </span>
                              <span>{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t pt-4">
                          <span className="font-semibold">Total: {formatPrice(order.total)}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-[#25D366]"
                            onClick={() => handleResendOrder(order)}
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            Reenviar pelo WhatsApp
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
                      <Package className="h-8 w-8 text-muted-foreground/60" />
                    </div>
                    <p className="mt-4 font-serif font-semibold">Nenhum pedido ainda</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Seus pedidos enviados pelo WhatsApp aparecerão aqui.
                    </p>
                    <Link href="/produtos" className="mt-6">
                      <Button variant="outline" className="gap-2 rounded-full">
                        <ShoppingBag className="h-4 w-4" />
                        Ver produtos
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favoritos">
              <div className="rounded-xl border bg-card p-6">
                <h2 className="mb-6 font-serif text-lg font-semibold">Meus Favoritos</h2>
                {favorites.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-6">
                    {favorites.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
                      <Heart className="h-8 w-8 text-muted-foreground/60" />
                    </div>
                    <p className="mt-4 font-serif font-semibold">Nenhum favorito</p>
                    <p className="mt-1 text-sm text-muted-foreground">Favorite produtos para encontrá-los facilmente.</p>
                    <Link href="/produtos" className="mt-6">
                      <Button variant="outline" className="gap-2 rounded-full">
                        <ShoppingBag className="h-4 w-4" />
                        Ver produtos
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  )
}
