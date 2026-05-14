"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await login(email, password)

    if (result.ok) {
      toast.success("Login realizado com sucesso!")
      router.push("/minha-conta")
    } else {
      toast.error(result.error || "E-mail ou senha incorretos")
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

          <h1 className="font-serif text-2xl font-bold lg:text-3xl">Entrar</h1>
          <p className="mt-2 text-muted-foreground">
            Acesse sua conta para ver favoritos e histórico de pedidos.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
            <div>
              <Label htmlFor="login-email">E-mail</Label>
              <Input
                id="login-email"
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
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Senha</Label>
                <button type="button" className="text-sm text-muted-foreground hover:text-foreground touch-target">
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative mt-1">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  enterKeyHint="go"
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

            <Button type="submit" className="w-full h-11 text-base touch-target" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link href="/cadastro" className="font-medium text-foreground underline hover:text-muted-foreground">
              Criar conta
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
          <h2 className="mt-8 text-center font-serif text-3xl font-bold">Vista propósito com estilo.</h2>
          <p className="mt-4 max-w-md text-center text-[#FAF9F6]/60">
            Camisetas cristãs criadas para expressar fé, identidade e mensagem no seu dia a dia.
          </p>
        </div>
      </div>
    </div>
  )
}
