export const WHATSAPP_NUMBER = "5532984872319"
export const WHATSAPP_DISPLAY = "(32) 98487-2319"
export const STORE_NAME = "Fashion Store"
export const STORE_TAGLINE = "Estilo • Qualidade • Confiança"
export const STORE_CITY = "Juiz de Fora/MG"
export const STORE_EMAIL = "diasygor312@gmail.com"
export const STORE_INSTAGRAM = "@fashion__store.99"
export const STORE_INSTAGRAM_URL = "https://www.instagram.com/fashion__store.99"

export function createWhatsAppLink(number: string, message: string): string {
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${number}?text=${encodedMessage}`
}

export function formatCartMessage(
  items: {
    name: string
    size: string
    color: string
    quantity: number
    price: number
  }[],
  customer: {
    name: string
    whatsapp: string
    email: string
    address?: string
    observation?: string
  },
  subtotal: number,
  orderNumber?: string
): string {
  const itemsList = items
    .map(
      (item) =>
        `• ${item.name}\n  Tamanho: ${item.size} | Cor: ${item.color}\n  Quantidade: ${item.quantity} | R$ ${item.price.toFixed(2).replace(".", ",")}`
    )
    .join("\n\n")

  let message = `Olá! Vim pelo site da ${STORE_NAME} e gostaria de finalizar este pedido:`

  if (orderNumber) {
    message += `\n\n*Pedido:* ${orderNumber}`
  }

  message += `\n\n*Cliente:* ${customer.name}
*WhatsApp:* ${customer.whatsapp}
*E-mail:* ${customer.email}

*Itens:*
${itemsList}

*Subtotal estimado:* R$ ${subtotal.toFixed(2).replace(".", ",")}`

  if (customer.address) {
    message += `\n\n*Endereço:*\n${customer.address}`
  }

  if (customer.observation) {
    message += `\n\n*Observação:*\n${customer.observation}`
  }

  message += `\n\nPoderia confirmar disponibilidade, forma de pagamento e entrega?`

  return message
}

export function formatProductMessage(productName: string): string {
  return `Olá! Vim pelo site da ${STORE_NAME} e tenho interesse no produto *${productName}*. Poderia me passar tamanhos, cores disponíveis, forma de pagamento e entrega?`
}

export function formatResendMessage(
  orderNumber: string,
  items: { productName: string; size: string; color: string; quantity: number; price: number }[],
  total: number
): string {
  const itemsList = items
    .map(
      (item) =>
        `• ${item.productName} (${item.size}, ${item.color}) x${item.quantity} — R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}`
    )
    .join("\n")

  return `Olá! Gostaria de verificar o status do meu pedido *${orderNumber}*.\n\n*Itens:*\n${itemsList}\n\n*Total estimado:* R$ ${total.toFixed(2).replace(".", ",")}\n\nPoderia me atualizar sobre o andamento?`
}
