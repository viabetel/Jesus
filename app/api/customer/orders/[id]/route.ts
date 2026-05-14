import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = getSupabase()
  if (!sb) return NextResponse.json({ error: "Banco não configurado." }, { status: 500 })

  const authHeader = request.headers.get("authorization") || ""
  const token = authHeader.replace("Bearer ", "").trim()
  if (!token) return NextResponse.json({ error: "Token obrigatório." }, { status: 401 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return NextResponse.json({ error: "Config ausente." }, { status: 500 })

  const uc = createClient(url, anonKey, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } })
  const { data: { user }, error: authErr } = await uc.auth.getUser(token)
  if (authErr || !user) return NextResponse.json({ error: "Sessão inválida." }, { status: 401 })

  const { data: order, error } = await sb.from("orders").select("*").eq("id", id).single()
  if (error || !order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 })

  // Security: only owner can see
  const isOwner = order.user_id === user.id || (!order.user_id && order.customer_email === user.email)
  if (!isOwner) return NextResponse.json({ error: "Acesso negado." }, { status: 403 })

  return NextResponse.json({
    id: order.id,
    orderNumber: order.number,
    date: order.created_at,
    updatedAt: order.updated_at,
    status: order.status,
    customerName: order.customer_name,
    customerWhatsapp: order.customer_whatsapp,
    customerEmail: order.customer_email,
    address: order.address || null,
    observation: order.observation || null,
    items: Array.isArray(order.items) ? order.items : [],
    subtotal: order.subtotal || order.total,
    total: order.total,
  })
}
