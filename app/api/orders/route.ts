import { NextResponse } from "next/server"
import { createOrder, type CreateOrderInput } from "@/lib/services/orders"
import { sendOrderConfirmation, sendAdminOrderNotification } from "@/lib/services/email"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"

/**
 * POST /api/orders — Public endpoint for customers to place orders.
 *
 * Accepts: { customerName, customerWhatsapp, customerEmail?, items, address?, observation? }
 * Returns: { success, order: { id, orderNumber, total } }
 *
 * Price is recalculated server-side. Stock is validated.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 })
  }

  const b = body as Record<string, unknown>

  // Validate required fields
  const customerName = typeof b.customerName === "string" ? b.customerName.trim() : ""
  const customerWhatsapp = typeof b.customerWhatsapp === "string" ? b.customerWhatsapp.trim() : ""
  const customerEmail = typeof b.customerEmail === "string" ? b.customerEmail.trim() : undefined
  const items = Array.isArray(b.items) ? b.items : []
  const address = typeof b.address === "string" ? b.address.trim() : undefined
  const observation = typeof b.observation === "string" ? b.observation.trim() : undefined

  if (!customerName) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 })
  }
  if (!customerWhatsapp) {
    return NextResponse.json({ error: "WhatsApp é obrigatório." }, { status: 400 })
  }
  if (items.length === 0) {
    return NextResponse.json({ error: "O pedido precisa ter pelo menos um item." }, { status: 400 })
  }

  // Validate each item
  for (const it of items) {
    if (!it.productId || !it.variantSku || typeof it.quantity !== "number" || it.quantity < 1) {
      return NextResponse.json({ error: "Item inválido no pedido." }, { status: 400 })
    }
  }

  try {
    const input: CreateOrderInput = {
      customerName,
      customerWhatsapp,
      customerEmail: customerEmail || "",
      items: items.map((it: { productId: string; variantSku: string; quantity: number }) => ({
        productId: it.productId,
        variantSku: it.variantSku,
        quantity: it.quantity,
      })),
      address,
      observation,
    }

    const result = await createOrder(input)

    if (!result.ok) {
      const err = result.error
      const msg = 'message' in err ? err.message
        : err.code === "PRODUCT_NOT_FOUND" ? `Produto não encontrado: ${err.sku}`
        : err.code === "VARIANT_NOT_FOUND" ? `Variação não encontrada: ${err.sku}`
        : err.code === "INSUFFICIENT_STOCK" ? `Estoque insuficiente para ${err.sku}: disponível ${err.available}, solicitado ${err.requested}`
        : "Erro ao processar pedido."
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    // Send email notifications (non-blocking but logged)
    const order = result.order
    const emailData = {
      customerName: order.customerName,
      customerEmail: order.customerEmail || customerEmail || "",
      orderNumber: order.number,
      items: order.items.map(it => ({
        productName: it.productName,
        color: it.color,
        size: it.size,
        quantity: it.quantity,
        price: it.price,
      })),
      total: order.total,
      whatsappLink: createWhatsAppLink(
        WHATSAPP_NUMBER,
        `Olá! Fiz o pedido ${order.number} pelo site e quero combinar pagamento/entrega.`
      ),
    }
    
    let emailSent = false
    let adminEmailSent = false
    
    try {
      emailSent = await sendOrderConfirmation(emailData)
      if (!emailSent) console.warn(`[Orders] Email de confirmação NÃO enviado para pedido ${order.number}`)
    } catch (emailErr) {
      console.error(`[Orders] Erro ao enviar email de confirmação para ${order.number}:`, emailErr)
    }
    
    try {
      adminEmailSent = await sendAdminOrderNotification({
        orderNumber: order.number,
        customerName: order.customerName,
        total: order.total,
        itemCount: order.items.length,
      })
      if (!adminEmailSent) console.warn(`[Orders] Notificação admin NÃO enviada para pedido ${order.number}`)
    } catch (adminErr) {
      console.error(`[Orders] Erro ao enviar notificação admin para ${order.number}:`, adminErr)
    }

    return NextResponse.json({
      success: true,
      order: {
        id: result.order.id,
        orderNumber: result.order.number,
        total: result.order.total,
        status: result.order.status,
      },
      emailSent,
      adminEmailSent,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar pedido."
    // Stock validation errors
    if (msg.includes("estoque") || msg.includes("indisponível") || msg.includes("Estoque")) {
      return NextResponse.json({ error: msg }, { status: 409 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
