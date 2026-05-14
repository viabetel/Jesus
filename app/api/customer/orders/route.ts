import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")
  if (!email) return NextResponse.json({ error: "Email obrigatório." }, { status: 400 })

  const sb = getSupabase()
  if (!sb) return NextResponse.json([], { status: 200 })

  try {
    const { data: orders, error } = await sb
      .from("orders")
      .select("*")
      .eq("customer_email", email)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) { console.error("[CustomerOrders]", error); return NextResponse.json([], { status: 200 }) }

    const mapped = (orders || []).map((o: any) => ({
      id: o.id,
      orderNumber: o.number || o.order_number || `FS-${o.id?.slice(0, 4)}`,
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
