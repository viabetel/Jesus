/**
 * Checklist de publicação do produto.
 *
 * Aceita um campo opcional `structuredMedia` que são as linhas da tabela
 * `product_media`. Quando presente, valida capa pela mídia estruturada
 * (role='cover'). Quando ausente, cai no fallback `images[]`.
 */

import type { Product } from "@/lib/data/products"

export type StructuredMediaItem = {
  role: string
  kind: string
}

export type ChecklistItem = {
  id: string
  label: string
  passed: boolean
  required: boolean
}

export type ChecklistInput = Product & {
  /** Mídia estruturada da tabela product_media. Se presente, valida cover por role. */
  structuredMedia?: StructuredMediaItem[]
}

export function getPublishChecklist(product: ChecklistInput): ChecklistItem[] {
  const hasActiveVariant = product.variants.some(v => v.active)
  const hasStockedVariant = product.variants.some(v => v.active && v.stock > 0)

  // Cover: prefere product_media com role=cover; fallback pra images[]
  let hasCover = false
  if (product.structuredMedia && product.structuredMedia.length > 0) {
    hasCover = product.structuredMedia.some(m => m.role === "cover" && m.kind === "image")
  } else {
    hasCover = product.images.length > 0
  }

  return [
    { id: "name", label: "Nome preenchido", passed: !!product.name?.trim(), required: true },
    { id: "slug", label: "Slug definido", passed: !!product.slug?.trim(), required: true },
    { id: "sku", label: "SKU definido", passed: !!product.sku?.trim(), required: true },
    { id: "price", label: "Preço válido (> 0)", passed: typeof product.price === "number" && product.price > 0, required: true },
    { id: "category", label: "Categoria definida", passed: !!product.category, required: true },
    { id: "description", label: "Descrição preenchida", passed: !!product.description?.trim(), required: true },
    { id: "cover", label: "Imagem de capa (cover)", passed: hasCover, required: true },
    { id: "variant", label: "Pelo menos 1 variante ativa", passed: hasActiveVariant, required: true },
    { id: "stock", label: "Pelo menos 1 variante com estoque", passed: hasStockedVariant, required: true },
    { id: "composition", label: "Composição informada", passed: !!product.composition?.trim(), required: false },
    { id: "care", label: "Cuidados informados", passed: Array.isArray(product.care) && product.care.length > 0, required: false },
  ]
}

export function canPublish(product: ChecklistInput): boolean {
  return getPublishChecklist(product).filter(c => c.required).every(c => c.passed)
}

export function getMissingRequirements(product: ChecklistInput): string[] {
  return getPublishChecklist(product)
    .filter(c => c.required && !c.passed)
    .map(c => c.label)
}
