/**
 * Email Service via Resend
 *
 * Env vars necessárias:
 *   RESEND_API_KEY   — chave da API Resend
 *   RESEND_FROM      — email de envio (ex: "Fashion Store <pedidos@seudominio.com>")
 *   STORE_NAME       — nome da loja (default: "Fashion Store")
 *
 * Instale: npm install resend
 */

import { Resend } from "resend"

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

const FROM = () => process.env.RESEND_FROM || "Fashion Store <onboarding@resend.dev>"
const STORE = () => process.env.STORE_NAME || "Fashion Store"

// ═══ Templates ═══

function baseLayout(content: string) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="font-size:18px;font-weight:700;color:#1a1a1a;margin:0;">${STORE()}</h1>
    </div>
    <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e8e4dc;">
      ${content}
    </div>
    <p style="text-align:center;font-size:11px;color:#999;margin-top:20px;">
      ${STORE()} · Juiz de Fora/MG<br/>
      Este email foi enviado automaticamente, não responda.
    </p>
  </div>
</body>
</html>`
}

// ═══ Order Confirmation (para o CLIENTE) ═══

type OrderEmailData = {
  customerName: string
  customerEmail: string
  orderNumber: string
  items: { productName: string; color: string; size: string; quantity: number; price: number }[]
  total: number
  whatsappLink?: string
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
  const resend = getResend()
  if (!resend) {
    console.log("[Email] Resend não configurado. Pulando envio de confirmação de pedido.")
    return false
  }

  const itemsHtml = data.items.map(it => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0ece4;font-size:13px;color:#333;">${it.quantity}× ${it.productName}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0ece4;font-size:12px;color:#666;">${it.color} · ${it.size}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0ece4;font-size:13px;color:#333;text-align:right;">R$ ${(it.price * it.quantity).toFixed(2)}</td>
    </tr>
  `).join("")

  const waButton = data.whatsappLink
    ? `<a href="${data.whatsappLink}" style="display:inline-block;margin-top:20px;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Combinar pelo WhatsApp</a>`
    : ""

  const html = baseLayout(`
    <h2 style="font-size:20px;font-weight:700;color:#1a1a1a;margin:0 0 4px;">Pedido recebido! ✓</h2>
    <p style="font-size:13px;color:#666;margin:0 0 20px;">Olá ${data.customerName}, seu pedido <strong>${data.orderNumber}</strong> foi registrado.</p>
    
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px 0;border-bottom:2px solid #1a1a1a;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">Item</th>
          <th style="text-align:left;padding:8px 0;border-bottom:2px solid #1a1a1a;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">Variação</th>
          <th style="text-align:right;padding:8px 0;border-bottom:2px solid #1a1a1a;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">Valor</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    
    <div style="text-align:right;margin-top:12px;">
      <p style="font-size:18px;font-weight:700;color:#1a1a1a;margin:0;">Total: R$ ${data.total.toFixed(2)}</p>
    </div>
    
    <div style="margin-top:20px;padding:16px;background:#f9f7f2;border-radius:8px;">
      <p style="font-size:13px;color:#555;margin:0;line-height:1.6;">
        <strong>Próximo passo:</strong> nossa equipe vai entrar em contato pelo WhatsApp para combinar pagamento e entrega.
      </p>
    </div>
    
    <div style="text-align:center;">
      ${waButton}
    </div>
  `)

  try {
    const { error } = await resend.emails.send({
      from: FROM(),
      to: data.customerEmail,
      subject: `Pedido ${data.orderNumber} recebido — ${STORE()}`,
      html,
    })
    if (error) {
      console.error("[Email] Erro ao enviar confirmação:", error)
      return false
    }
    return true
  } catch (e) {
    console.error("[Email] Exceção ao enviar:", e)
    return false
  }
}

// ═══ Order Status Update (para o CLIENTE) ═══

export async function sendOrderStatusUpdate(data: {
  customerName: string
  customerEmail: string
  orderNumber: string
  newStatus: string
  statusMessage: string
}): Promise<boolean> {
  const resend = getResend()
  if (!resend) return false

  const statusColors: Record<string, string> = {
    confirmado: "#f59e0b",
    enviado: "#8b5cf6",
    entregue: "#22c55e",
    cancelado: "#ef4444",
  }
  const color = statusColors[data.newStatus] || "#666"

  const html = baseLayout(`
    <h2 style="font-size:20px;font-weight:700;color:#1a1a1a;margin:0 0 4px;">Atualização do pedido</h2>
    <p style="font-size:13px;color:#666;margin:0 0 20px;">Olá ${data.customerName}, seu pedido <strong>${data.orderNumber}</strong> foi atualizado.</p>
    
    <div style="text-align:center;padding:20px;background:#f9f7f2;border-radius:8px;">
      <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#999;margin:0 0 8px;">Status atual</p>
      <p style="font-size:20px;font-weight:700;color:${color};margin:0;">${data.statusMessage}</p>
    </div>
    
    <p style="font-size:13px;color:#555;margin-top:20px;line-height:1.6;">
      Se tiver dúvidas, entre em contato conosco pelo WhatsApp.
    </p>
  `)

  try {
    const { error } = await resend.emails.send({
      from: FROM(),
      to: data.customerEmail,
      subject: `Pedido ${data.orderNumber}: ${data.statusMessage} — ${STORE()}`,
      html,
    })
    if (error) { console.error("[Email] Erro status update:", error); return false }
    return true
  } catch (e) {
    console.error("[Email] Exceção status:", e)
    return false
  }
}

// ═══ Welcome Email (registro de conta) ═══

export async function sendWelcomeEmail(data: {
  name: string
  email: string
}): Promise<boolean> {
  const resend = getResend()
  if (!resend) return false

  const html = baseLayout(`
    <h2 style="font-size:20px;font-weight:700;color:#1a1a1a;margin:0 0 4px;">Bem-vindo(a) à ${STORE()}! 🎉</h2>
    <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 20px;">
      Olá ${data.name}, sua conta foi criada com sucesso.
    </p>
    <p style="font-size:13px;color:#666;line-height:1.6;">
      Agora você pode favoritar produtos, acompanhar pedidos e receber ofertas exclusivas.
    </p>
    <div style="text-align:center;margin-top:24px;">
      <a href="#" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 32px;border-radius:0;text-decoration:none;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;font-weight:600;">Ver Catálogo</a>
    </div>
  `)

  try {
    const { error } = await resend.emails.send({
      from: FROM(),
      to: data.email,
      subject: `Bem-vindo(a) à ${STORE()}!`,
      html,
    })
    if (error) { console.error("[Email] Erro welcome:", error); return false }
    return true
  } catch (e) {
    console.error("[Email] Exceção welcome:", e)
    return false
  }
}

// ═══ Admin Notification (novo pedido) ═══

export async function sendAdminOrderNotification(data: {
  orderNumber: string
  customerName: string
  total: number
  itemCount: number
}): Promise<boolean> {
  const resend = getResend()
  if (!resend) return false
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return false

  const html = baseLayout(`
    <h2 style="font-size:20px;font-weight:700;color:#1a1a1a;margin:0 0 4px;">Novo pedido! 🛒</h2>
    <p style="font-size:13px;color:#666;margin:0 0 16px;">Um novo pedido foi registrado no sistema.</p>
    <table style="width:100%;">
      <tr><td style="padding:6px 0;font-size:13px;color:#999;">Pedido</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#1a1a1a;">${data.orderNumber}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#999;">Cliente</td><td style="padding:6px 0;font-size:13px;color:#333;">${data.customerName}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#999;">Itens</td><td style="padding:6px 0;font-size:13px;color:#333;">${data.itemCount}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#999;">Total</td><td style="padding:6px 0;font-size:18px;font-weight:700;color:#1a1a1a;">R$ ${data.total.toFixed(2)}</td></tr>
    </table>
  `)

  try {
    const { error } = await resend.emails.send({
      from: FROM(),
      to: adminEmail,
      subject: `Novo pedido ${data.orderNumber} — R$ ${data.total.toFixed(2)}`,
      html,
    })
    if (error) { console.error("[Email] Erro admin notify:", error); return false }
    return true
  } catch (e) {
    console.error("[Email] Exceção admin:", e)
    return false
  }
}
