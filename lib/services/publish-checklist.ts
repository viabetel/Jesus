/**
 * Checklist de publicação para loja de roupa.
 *
 * Valida tudo que um produto precisa antes de ir pro ar:
 * identidade, preço, variantes, mídia, conteúdo da peça.
 */

import type { Product } from "@/lib/data/products"

export type StructuredMediaItem = {
  role: string
  kind: string
  colorKey?: string | null
}

export type ChecklistItem = {
  id: string
  label: string
  passed: boolean
  required: boolean
}

export type ChecklistInput = Product & {
  structuredMedia?: StructuredMediaItem[]
}

export function getPublishChecklist(product: ChecklistInput): ChecklistItem[] {
  const activeVariants = product.variants.filter(v => v.active)
  const hasActiveVariant = activeVariants.length > 0
  const hasStockedVariant = activeVariants.some(v => v.stock > 0)

  // Cores ativas (pelo menos uma)
  const activeColors = new Set(activeVariants.map(v => v.colorName))
  const hasActiveColor = activeColors.size > 0

  // Cover: prefere product_media → fallback images[]
  let hasCover = false
  if (product.structuredMedia && product.structuredMedia.length > 0) {
    hasCover = product.structuredMedia.some(m => m.role === "cover" && m.kind === "image")
  } else {
    hasCover = product.images.length > 0
  }

  // Preço promo coerente
  const promoCoherent = !product.originalPrice || product.originalPrice > product.price

  // SKUs únicos (checa se tem duplicata entre variantes)
  const skus = product.variants.map(v => v.sku)
  const uniqueSkus = new Set(skus)
  const skusUnique = skus.length === uniqueSkus.size

  // Cores únicas (não duas variantes com mesmo colorName+size)
  const combos = product.variants.map(v => `${v.colorName}|${v.size}`)
  const uniqueCombos = new Set(combos)
  const combosUnique = combos.length === uniqueCombos.size

  return [
    // --- Identidade ---
    { id: "name", label: "Nome preenchido", passed: !!product.name?.trim(), required: true },
    { id: "slug", label: "Slug definido", passed: !!product.slug?.trim(), required: true },
    { id: "sku", label: "SKU base definido", passed: !!product.sku?.trim(), required: true },
    { id: "category", label: "Categoria definida", passed: !!product.category, required: true },
    { id: "description", label: "Descrição preenchida", passed: !!product.description?.trim(), required: true },

    // --- Preço ---
    { id: "price", label: "Preço válido (> 0)", passed: typeof product.price === "number" && product.price > 0, required: true },
    { id: "promo_coherent", label: "Preço promocional coerente", passed: promoCoherent, required: true },

    // --- Variantes ---
    { id: "color", label: "Pelo menos 1 cor ativa", passed: hasActiveColor, required: true },
    { id: "variant", label: "Pelo menos 1 variante ativa", passed: hasActiveVariant, required: true },
    { id: "stock", label: "Pelo menos 1 variante com estoque", passed: hasStockedVariant, required: true },
    { id: "skus_unique", label: "SKUs sem duplicata", passed: skusUnique, required: true },
    { id: "combos_unique", label: "Sem cor+tamanho duplicado", passed: combosUnique, required: true },

    // --- Mídia ---
    { id: "cover", label: "Imagem de capa (cover)", passed: hasCover, required: true },
    { id: "media_per_color", label: "Cada cor ativa tem mídia própria ou geral", passed: (() => {
      if (!product.structuredMedia || product.structuredMedia.length === 0) return true // sem mídia estruturada, não cobra
      // Pra cada cor ativa, verifica se tem pelo menos 1 mídia (da cor ou geral)
      const hasGeneralMedia = product.structuredMedia.some(m => !m.colorKey)
      for (const color of activeColors) {
        const colorKey = color.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toLowerCase()
        const hasColorMedia = product.structuredMedia.some(m => m.colorKey === colorKey)
        if (!hasColorMedia && !hasGeneralMedia) return false
      }
      return true
    })(), required: false },
    { id: "cover_per_color", label: "Cada cor ativa tem cover própria", passed: (() => {
      if (!product.structuredMedia || product.structuredMedia.length === 0) return true
      for (const color of activeColors) {
        const colorKey = color.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toLowerCase()
        const hasColorCover = product.structuredMedia.some(m => m.colorKey === colorKey && m.role === "cover")
        const hasGeneralCover = product.structuredMedia.some(m => !m.colorKey && m.role === "cover")
        if (!hasColorCover && !hasGeneralCover) return false
      }
      return true
    })(), required: false },

    // --- Conteúdo (opcionais mas recomendados) ---
    { id: "composition", label: "Composição informada", passed: !!product.composition?.trim(), required: false },
    { id: "fit", label: "Modelagem informada", passed: !!product.fit?.trim(), required: false },
    { id: "care", label: "Cuidados informados", passed: Array.isArray(product.care) && product.care.length > 0, required: false },
    { id: "size_guide", label: "Guia de medidas preenchido", passed: Array.isArray(product.sizeGuide) && product.sizeGuide.length > 0, required: false },
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
