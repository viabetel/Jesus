"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { formatPhone, isValidPhone, isValidEmail } from "@/lib/phone"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidPhone(whatsapp)) {
      toast.error("Informe um WhatsApp válido com DDD")
      return
    }

    if (!isValidEmail(email)) {
      toast.error("Informe um e-mail válido")
      return
    }

    if (password.length < 4) {
      toast.error("A senha deve ter pelo menos 4 caracteres")
      return
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    if (!acceptTerms) {
      toast.error("Aceite a política de privacidade")
      return
    }

    setIsLoading(true)
    const result = await register({ name, email, whatsapp, password })

    if (result.ok) {
      toast.success("Conta criada com sucesso!")
      router.push("/minha-conta")
    } else {
      toast.error(result.error || "Erro ao criar conta")
    }
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-dvh">
      {/* Left Side — Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-12 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-3">
            <Image src="/brand/logo-dark.png" alt="Fashion Store" width={48} height={48} className="h-12 w-12" />
            <span className="font-serif text-xl font-semibold">Fashion Store</span>
          </Link>

          <h1 className="font-serif text-2xl font-bold lg:text-3xl">Criar Conta</h1>
          <p className="mt-2 text-muted-foreground">
            Crie sua conta para favoritar produtos e acompanhar pedidos.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <Label htmlFor="reg-name">Nome completo</Label>
              <Input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                autoComplete="name"
                enterKeyHint="next"
                className="mt-1 h-11 text-base"
                required
              />
            </div>

            <div>
              <Label htmlFor="reg-email">E-mail</Label>
              <Input
                id="reg-email"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                enterKeyHint="next"
                className="mt-1 h-11 text-base"
                required
              />
            </div>

            <div>
              <Label htmlFor="reg-whatsapp">WhatsApp</Label>
              <Input
                id="reg-whatsapp"
                type="tel"
                inputMode="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                placeholder="(32) 99999-9999"
                autoComplete="tel"
                enterKeyHint="next"
                maxLength={15}
                className="mt-1 h-11 text-base"
                required
              />
            </div>

            <div>
              <Label htmlFor="reg-password">Senha</Label>
              <div className="relative mt-1">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crie uma senha"
                  autoComplete="new-password"
                  enterKeyHint="next"
                  className="h-11 pr-10 text-base"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground touch-target"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="reg-confirm">Confirmar senha</Label>
              <Input
                id="reg-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                autoComplete="new-password"
                enterKeyHint="done"
                className="mt-1 h-11 text-base"
                required
              />
            </div>

            <div className="flex items-start gap-2 pt-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(!!checked)}
              />
              <Label htmlFor="terms" className="text-sm font-normal leading-relaxed">
                Li e aceito a{" "}
                <Link href="/privacidade" className="underline hover:text-muted-foreground">
                  política de privacidade
                </Link>
              </Label>
            </div>

            <Button type="submit" className="w-full h-11 text-base touch-target" disabled={isLoading || !acceptTerms}>
              {isLoading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-medium text-foreground underline hover:text-muted-foreground">
              Entrar
            </Link>
          </p>

          <Link href="/" className="mt-8 block text-center text-sm text-muted-foreground hover:text-foreground">
            Voltar para a loja
          </Link>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden bg-[#1a1a1a] lg:block lg:w-1/2">
        <div className="flex h-full flex-col items-center justify-center p-12 text-[#FAF9F6]">
          <Image src="/brand/logo-light.png" alt="Fashion Store" width={120} height={120} className="h-28 w-28" />
          <h2 className="mt-8 text-center font-serif text-3xl font-bold">Faça parte da Fashion Store</h2>
          <p className="mt-4 max-w-md text-center text-[#FAF9F6]/60">
            Crie sua conta e tenha acesso a favoritos, histórico de pedidos e ofertas exclusivas.
          </p>
        </div>
      </div>
    </div>
  )
}
