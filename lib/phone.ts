/**
 * Phone formatting utilities for Brazilian phone numbers
 */

/**
 * Format a phone string as (XX) XXXXX-XXXX or (XX) XXXX-XXXX
 * Strips non-digits and applies mask progressively
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)

  if (digits.length === 0) return ""
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

/**
 * Extract only digits from a formatted phone
 */
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "")
}

/**
 * Validate a Brazilian phone number (10 or 11 digits)
 */
export function isValidPhone(value: string): boolean {
  const digits = phoneDigits(value)
  return digits.length >= 10 && digits.length <= 11
}

/**
 * Validate email format
 */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

/**
 * Normaliza WhatsApp brasileiro para uso em wa.me / WhatsApp API.
 *
 * Aceita qualquer formato de entrada — "(32) 99999-9999", "32999999999",
 * "+55 32 99999 9999" — e devolve sempre o número internacional sem
 * sinais: "5532999999999".
 *
 * Retorna `null` se o número for inválido.
 */
export function normalizeBrazilWhatsapp(value: string | null | undefined): string | null {
  if (!value) return null
  let digits = phoneDigits(value)
  // Remove zero/zeros à esquerda
  digits = digits.replace(/^0+/, "")
  // Remove o "55" duplicado se já vier com país
  if (digits.length > 11 && digits.startsWith("55")) {
    digits = digits.slice(2)
  }
  // Aceita 10 (fixo) ou 11 (celular) dígitos brasileiros
  if (digits.length < 10 || digits.length > 11) return null
  return `55${digits}`
}

/**
 * Monta um link wa.me a partir de qualquer formato de telefone.
 * Retorna null se o número for inválido.
 */
export function whatsappLink(phone: string | null | undefined, message?: string): string | null {
  const normalized = normalizeBrazilWhatsapp(phone)
  if (!normalized) return null
  const base = `https://wa.me/${normalized}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
