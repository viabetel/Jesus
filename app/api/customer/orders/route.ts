import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

/**
 * GET /api/customer/orders
 *
 * Busca pedidos do usuário autenticado via Supabase Auth.
 * Valida token do header Authorization: Bearer <access_token>
 */
export async function GET(request: Request) {
  const sb = getSupabase()
  if (!sb) return NextResponse.json([], { status: 200 })

  // Extract token from Authorization header
  const authHeader = request.headers.get("authorization") || ""
  const token = authHeader.replace("Bearer ", "").trim()

  if (!token) {
    return NextResponse.json({ error: "Token de autenticação obrigatório." }, { status: 401 })
  }

  // Validate token and get user
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 500 })
  }

  const userClient = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data: { user }, error: authError } = await userClient.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 })
  }

  try {
    // Fetch orders by user email (from validated session)
    const { data: orders, error } = await sb
      .from("orders")
      .select("*")
      .eq("customer_email", user.email!)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("[CustomerOrders]", error)
      return NextResponse.json([], { status: 200 })
    }

    const mapped = (orders || []).map((o: any) => ({
      id: o.id,
      orderNumber: o.number || o.order_number || `FS-${String(o.id).slice(0, 4)}`,
      date: o.created_at,
      items: Array.isArray(o.items) ? o.items.map((it: any) => ({
        productName: it.product_name || it.productName || "",
        size: it.size || "",
        color: it.color || "",
        quantity: it.quantity || 1,
        price: it.price || 0,
      })) : [],
      total: o.total || 0,
      status: o.status || "recebido",
      observation: o.observation || "",
    }))
    return NextResponse.json(mapped)
  } catch (e) {
    console.error("[CustomerOrders] Exception:", e)
    return NextResponse.json([], { status: 200 })
  }
}
