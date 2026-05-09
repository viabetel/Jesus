"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()
  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }
  return (
    <button
      onClick={handleLogout}
      className="flex h-8 items-center gap-1.5 rounded border border-neutral-800 bg-neutral-900 px-3 text-[11px] text-neutral-300 hover:bg-neutral-800"
      title="Sair"
    >
      <LogOut className="h-3 w-3" /> Sair
    </button>
  )
}
