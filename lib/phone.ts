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
