import { Loader2 } from "lucide-react"

export function AuthLoadingScreen({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="mx-auto mb-6 h-12 w-12 bg-[var(--ink)]" />
        <p className="font-serif text-lg font-bold">Fashion Store</p>
        <div className="mt-6 flex items-center justify-center gap-2 text-[13px] text-[var(--muted-foreground)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          {message}
        </div>
      </div>
    </div>
  )
}
