import type { Product } from "./products"
import { products, getTotalStock, getProductColors, getProductSizes } from "./products"

export type Severity = "error" | "warning" | "info"
export interface Issue { productId: string; productName: string; slug: string; severity: Severity; code: string; message: string }

export function validateProduct(p: Product): Issue[] {
  const issues: Issue[] = []
  const add = (sev: Severity, code: string, msg: string) => issues.push({ productId: p.id, productName: p.name, slug: p.slug, severity: sev, code, message: msg })
  if (!p.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) add("error", "BAD_SLUG", `Slug inválido: "${p.slug}"`)
  if (!p.price || p.price <= 0) add("error", "NO_PRICE", "Sem preço válido")
  if (!p.sku) add("error", "NO_SKU", "Sem SKU")
  if (!p.images.length) add("error", "NO_IMAGES", "Sem imagens")
  else if (p.images.length < 2) add("warning", "FEW_IMAGES", "Apenas 1 imagem")
  if (!p.video) add("info", "NO_VIDEO", "Sem vídeo")
  const stock = getTotalStock(p)
  if (stock === 0) add("warning", "NO_STOCK", "Sem estoque")
  else if (stock <= 5) add("info", "LOW_STOCK", `Estoque baixo: ${stock}`)
  if (p.variants.length === 0) add("error", "NO_VARIANTS", "Sem variantes")
  if (getProductColors(p).length === 0) add("error", "NO_COLORS", "Sem cores")
  if (getProductSizes(p).length === 0) add("error", "NO_SIZES", "Sem tamanhos")
  if (!p.description || p.description.length < 20) add("warning", "SHORT_DESC", "Descrição curta")
  for (const [i, url] of p.images.entries()) { if (!url) add("error", "EMPTY_URL", `Imagem ${i + 1}: URL vazia`) }
  return issues
}

export function validateCatalog() {
  const issues: Issue[] = []
  for (const p of products) issues.push(...validateProduct(p))

  // Slugs duplicados
  const slugs = new Map<string, string[]>()
  for (const p of products) { slugs.set(p.slug, [...(slugs.get(p.slug) || []), p.name]) }
  for (const [slug, names] of slugs) {
    if (names.length > 1) names.forEach(n => issues.push({
      productId: "", productName: n, slug, severity: "error",
      code: "DUP_SLUG", message: `Slug duplicado: ${names.join(", ")}`
    }))
  }

  // SKUs de produto duplicados
  const productSkus = new Map<string, string[]>()
  for (const p of products) { productSkus.set(p.sku, [...(productSkus.get(p.sku) || []), p.name]) }
  for (const [sku, names] of productSkus) {
    if (names.length > 1) names.forEach(n => issues.push({
      productId: "", productName: n, slug: "", severity: "error",
      code: "DUP_PRODUCT_SKU", message: `SKU de produto duplicado "${sku}" em: ${names.join(", ")}`
    }))
  }

  // SKUs de variante duplicados (entre produtos)
  const variantSkus = new Map<string, { product: string; slug: string }[]>()
  for (const p of products) {
    for (const v of p.variants) {
      const list = variantSkus.get(v.sku) || []
      list.push({ product: p.name, slug: p.slug })
      variantSkus.set(v.sku, list)
    }
  }
  for (const [sku, refs] of variantSkus) {
    if (refs.length > 1) {
      issues.push({
        productId: "", productName: refs[0].product, slug: refs[0].slug, severity: "error",
        code: "DUP_VARIANT_SKU",
        message: `SKU de variante duplicado "${sku}" em: ${refs.map(r => r.product).join(", ")}`
      })
    }
  }

  const e = issues.filter(i => i.severity === "error").length
  const w = issues.filter(i => i.severity === "warning").length
  const inf = issues.filter(i => i.severity === "info").length
  return { issues, summary: { errors: e, warnings: w, infos: inf, total: issues.length } }
}
