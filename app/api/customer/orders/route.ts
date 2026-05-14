import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  const sb = getSupabase()
  if (!sb) return NextResponse.json({ error: "Banco não configurado." }, { status: 500 })

  // Validate auth token
  const authHeader = request.headers.get("authorization") || ""
  const token = authHeader.replace("Bearer ", "").trim()
  if (!token) return NextResponse.json({ error: "Token obrigatório." }, { status: 401 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return NextResponse.json({ error: "Supabase não configurado." }, { status: 500 })

  const userClient = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: { user }, error: authError } = await userClient.auth.getUser(token)
  if (authError || !user) return NextResponse.json({ error: "Sessão inválida." }, { status: 401 })

  try {
    // 1. Orders by user_id (linked to auth)
    const { data: byUserId, error: err1 } = await sb
      .from("orders").select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    // 2. Fallback: orders without user_id but with matching email (legacy)
    const { data: byEmail, error: err2 } = await sb
      .from("orders").select("*")
      .is("user_id", null)
      .eq("customer_email", user.email!)
      .order("created_at", { ascending: false })
      .limit(50)

    if (err1 || err2) {
      console.error("[CustomerOrders]", err1 || err2)
      return NextResponse.json({ error: "Erro ao buscar pedidos." }, { status: 500 })
    }

    // Merge + deduplicate by id
    const seen = new Set<string>()
    const all = [...(byUserId || []), ...(byEmail || [])].filter(o => {
      if (seen.has(o.id)) return false
      seen.add(o.id); return true
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const mapped = all.map((o: any) => ({
      id: o.id,
      orderNumber: o.number || `FS-${String(o.id).slice(0, 4)}`,
      date: o.created_at,
      items: Array.isArray(o.items) ? o.items.map((it: any) => ({
        productName: it.product_name || it.productName || "",
        size: it.size || "", color: it.color || "",
        quantity: it.quantity || 1, price: it.price || 0,
      })) : [],
      total: o.total || 0,
      status: o.status || "recebido",
      observation: o.observation || "",
    }))
    return NextResponse.json(mapped)
  } catch (e) {
    console.error("[CustomerOrders] Exception:", e)
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
