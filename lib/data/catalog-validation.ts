/**
 * Fashion Store — Catalog Validation
 *
 * Validates products for common issues before they go live.
 */

import type { Product } from "./products"
import { products } from "./products"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ValidationSeverity = "error" | "warning" | "info"

export interface ValidationIssue {
  productId: string
  productName: string
  slug: string
  severity: ValidationSeverity
  code: string
  message: string
}

// ---------------------------------------------------------------------------
// Single product validation
// ---------------------------------------------------------------------------

export function validateProduct(product: Product): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  const add = (severity: ValidationSeverity, code: string, message: string) => {
    issues.push({
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      severity,
      code,
      message,
    })
  }

  // Slug
  if (!product.slug || product.slug.trim().length === 0) {
    add("error", "NO_SLUG", "Produto sem slug")
  }
  if (product.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug)) {
    add("warning", "BAD_SLUG", `Slug com formato inválido: "${product.slug}"`)
  }

  // Price
  if (!product.price || product.price <= 0) {
    add("error", "NO_PRICE", "Produto sem preço ou preço inválido")
  }
  if (product.originalPrice && product.originalPrice <= product.price) {
    add("warning", "BAD_ORIGINAL_PRICE", "Preço original menor ou igual ao preço atual")
  }

  // Images / cover
  if (!product.images || product.images.length === 0) {
    add("error", "NO_IMAGES", "Produto sem nenhuma imagem")
  } else if (product.images.length < 2) {
    add("warning", "FEW_IMAGES", "Produto com apenas 1 imagem (sem hover)")
  }

  // Broken URLs (basic check)
  for (const [idx, url] of product.images.entries()) {
    if (!url || url.trim().length === 0) {
      add("error", "EMPTY_IMAGE_URL", `Imagem ${idx + 1}: URL vazia`)
    }
  }

  // Video
  if (!product.video) {
    add("info", "NO_VIDEO", "Produto sem vídeo")
  }

  // Stock
  if (product.stock <= 0) {
    add("warning", "NO_STOCK", "Produto sem estoque")
  }
  if (product.stock > 0 && product.stock <= 3) {
    add("info", "LOW_STOCK", `Estoque muito baixo: ${product.stock} unidades`)
  }

  // Sizes / Colors
  if (!product.sizes || product.sizes.length === 0) {
    add("error", "NO_SIZES", "Produto sem tamanhos definidos")
  }
  if (!product.colors || product.colors.length === 0) {
    add("error", "NO_COLORS", "Produto sem cores definidas")
  }

  // Description
  if (!product.description || product.description.trim().length < 20) {
    add("warning", "SHORT_DESCRIPTION", "Descrição muito curta")
  }

  return issues
}

// ---------------------------------------------------------------------------
// Full catalog validation
// ---------------------------------------------------------------------------

export function validateCatalog(): {
  issues: ValidationIssue[]
  summary: { errors: number; warnings: number; infos: number; total: number }
} {
  const allIssues: ValidationIssue[] = []

  // Per-product validation
  for (const product of products) {
    allIssues.push(...validateProduct(product))
  }

  // Duplicate slug detection
  const slugs = new Map<string, string[]>()
  for (const product of products) {
    const existing = slugs.get(product.slug) || []
    existing.push(product.name)
    slugs.set(product.slug, existing)
  }
  for (const [slug, names] of slugs) {
    if (names.length > 1) {
      for (const name of names) {
        allIssues.push({
          productId: "",
          productName: name,
          slug,
          severity: "error",
          code: "DUPLICATE_SLUG",
          message: `Slug "${slug}" duplicado entre: ${names.join(", ")}`,
        })
      }
    }
  }

  // Duplicate image URLs across products
  const imageMap = new Map<string, string[]>()
  for (const product of products) {
    for (const url of product.images) {
      const existing = imageMap.get(url) || []
      existing.push(product.name)
      imageMap.set(url, existing)
    }
  }
  for (const [url, names] of imageMap) {
    if (names.length > 1) {
      allIssues.push({
        productId: "",
        productName: names[0],
        slug: "",
        severity: "warning",
        code: "DUPLICATE_IMAGE",
        message: `Imagem repetida em: ${names.join(", ")}`,
      })
    }
  }

  const errors = allIssues.filter((i) => i.severity === "error").length
  const warnings = allIssues.filter((i) => i.severity === "warning").length
  const infos = allIssues.filter((i) => i.severity === "info").length

  return {
    issues: allIssues,
    summary: { errors, warnings, infos, total: allIssues.length },
  }
}
