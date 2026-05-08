/**
 * Fashion Store — Product Variants System
 *
 * Supports granular stock per color × size.
 * Backward-compatible: derives variant matrix from legacy flat stock.
 */

import type { Product, ProductColor, ProductSize } from "./products"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductVariant {
  id: string
  productId: string
  colorName: string
  colorHex: string
  size: ProductSize
  stock: number
  sku?: string
  active: boolean
}

// ---------------------------------------------------------------------------
// Backward-compat: derive variants from legacy product
// ---------------------------------------------------------------------------

/**
 * Generates a synthetic variant matrix from the legacy flat product.
 * Distributes total stock evenly across color × size combos.
 */
export function getProductVariants(product: Product): ProductVariant[] {
  const { id, colors, sizes, stock } = product
  if (colors.length === 0 || sizes.length === 0) return []

  const totalCombos = colors.length * sizes.length
  const perCombo = Math.floor(stock / totalCombos)
  let remainder = stock - perCombo * totalCombos

  const variants: ProductVariant[] = []

  for (const color of colors) {
    for (const size of sizes) {
      const extra = remainder > 0 ? 1 : 0
      if (remainder > 0) remainder--

      variants.push({
        id: `${id}-${color.name.toLowerCase()}-${size}`,
        productId: id,
        colorName: color.name,
        colorHex: color.value,
        size,
        stock: perCombo + extra,
        sku: `${product.slug}-${color.name.toLowerCase()}-${size}`.toUpperCase(),
        active: true,
      })
    }
  }

  return variants
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function getVariantStock(
  product: Product,
  colorName: string,
  size: ProductSize
): number {
  const variants = getProductVariants(product)
  const v = variants.find((v) => v.colorName === colorName && v.size === size)
  return v?.stock ?? 0
}

export function getAvailableSizes(product: Product, colorName?: string): ProductSize[] {
  const variants = getProductVariants(product)
  const filtered = colorName
    ? variants.filter((v) => v.colorName === colorName && v.stock > 0)
    : variants.filter((v) => v.stock > 0)

  const unique = [...new Set(filtered.map((v) => v.size))]
  const order: ProductSize[] = ["P", "M", "G", "GG"]
  return unique.sort((a, b) => order.indexOf(a) - order.indexOf(b))
}

export function getAvailableColors(product: Product, size?: ProductSize): ProductColor[] {
  const variants = getProductVariants(product)
  const filtered = size
    ? variants.filter((v) => v.size === size && v.stock > 0)
    : variants.filter((v) => v.stock > 0)

  const seen = new Set<string>()
  const result: ProductColor[] = []
  for (const v of filtered) {
    if (!seen.has(v.colorName)) {
      seen.add(v.colorName)
      result.push({ name: v.colorName, value: v.colorHex })
    }
  }
  return result
}

export function getTotalStock(product: Product): number {
  return getProductVariants(product).reduce((sum, v) => sum + v.stock, 0)
}
