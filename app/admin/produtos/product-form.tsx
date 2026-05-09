"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Save, ArrowLeft, AlertCircle, Loader2, Plus, Trash2,
  ToggleLeft, ToggleRight, Info,
} from "lucide-react"
import type {
  Product, ProductCategory, ProductStatus, ProductSize, ProductBadge,
} from "@/lib/data/products"
import { MediaManager } from "@/components/admin/media-manager"

const CATEGORIES: ProductCategory[] = [
  "Camisetas cristãs", "Tradicionais", "Oversized", "Lançamentos", "Promoções",
]
const STATUSES: ProductStatus[] = ["ativo", "rascunho", "oculto", "esgotado"]
const BADGES: (ProductBadge | "")[] = [
  "", "Novidade", "Promoção", "Lançamento", "Mais vendida",
  "Últimas unidades", "Esgotado", "Disponível",
]
const SIZES: ProductSize[] = ["P", "M", "G", "GG"]

export function ProductForm({ initial }: { initial: Product | null }) {
  const router = useRouter()
  const isNew = !initial

  // Estado do produto
  const [name, setName] = useState(initial?.name ?? "")
  const [slug, setSlug] = useState(initial?.slug ?? "")
  const [sku, setSku] = useState(initial?.sku ?? "")
  const [category, setCategory] = useState<ProductCategory>(initial?.category ?? "Camisetas cristãs")
  const [status, setStatus] = useState<ProductStatus>(initial?.status ?? "ativo")
  const [price, setPrice] = useState(initial?.price?.toString() ?? "")
  const [originalPrice, setOriginalPrice] = useState(initial?.originalPrice?.toString() ?? "")
  const [badge, setBadge] = useState<string>(initial?.badge ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [details, setDetails] = useState(initial?.details?.join("\n") ?? "")
  const [tags, setTags] = useState(initial?.tags?.join(", ") ?? "")
  const [isNew_, setIsNew_] = useState(initial?.isNew ?? false)
  const [isPromotion, setIsPromotion] = useState(initial?.isPromotion ?? false)
  const [isBestseller, setIsBestseller] = useState(initial?.isBestseller ?? false)

  // Variantes (só pra editar — em criar começa vazio)
  const [variants, setVariants] = useState(initial?.variants ?? [])
  const [newColorName, setNewColorName] = useState("")
  const [newColorHex, setNewColorHex] = useState("#000000")
  const [newSize, setNewSize] = useState<ProductSize>("M")
  const [newStock, setNewStock] = useState("0")

  const [saving, setSaving] = useState(false)
  const [savingVariant, setSavingVariant] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)

  // Auto-gera slug a partir do nome (só na criação)
  const handleNameChange = (v: string) => {
    setName(v)
    if (isNew && !slug) {
      const auto = v.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      setSlug(auto)
    }
  }

  const handleSave = async () => {
    setError(null)
    const priceNum = parseFloat(price)
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError("Preço inválido"); return
    }
    const origPriceNum = originalPrice ? parseFloat(originalPrice) : null
    if (origPriceNum != null && origPriceNum <= priceNum) {
      setError("Preço original deve ser maior que o preço atual"); return
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      sku: sku.trim(),
      category,
      status,
      price: priceNum,
      originalPrice: origPriceNum,
      badge: badge || null,
      description: description.trim(),
      details: details.split("\n").map(s => s.trim()).filter(Boolean),
      // Os campos `images[]` e `video` legados são preservados pelo backend.
      // A mídia estruturada (com role e ordem) é gerenciada na tabela product_media
      // via /api/admin/products/[id]/media (ações imediatas, não dependem desse Salvar).
      tags: tags.split(",").map(s => s.trim()).filter(Boolean),
      isNew: isNew_,
      isPromotion,
      isBestseller,
    }

    setSaving(true)
    try {
      const url = isNew ? "/api/admin/products" : `/api/admin/products/${initial.id}`
      const method = isNew ? "POST" : "PATCH"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = typeof data.error === "object" ? data.error.message : data.error
        setError(msg ?? "Erro ao salvar")
        setSaving(false)
        return
      }
      if (isNew) {
        router.push(`/admin/produtos/${data.id}`)
      } else {
        setSavedFlash(true)
        setTimeout(() => setSavedFlash(false), 2000)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro de rede")
    } finally {
      setSaving(false)
    }
  }

  const handleAddVariant = async () => {
    if (!initial) return
    if (!newColorName.trim()) { alert("Nome da cor obrigatório"); return }
    setSavingVariant(true)
    try {
      const res = await fetch("/api/admin/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: initial.id,
          colorName: newColorName.trim(),
          colorHex: newColorHex,
          size: newSize,
          stock: parseInt(newStock) || 0,
          active: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert("Erro: " + (data.error?.message ?? "desconhecido"))
        return
      }
      setVariants(prev => {
        const idx = prev.findIndex(v => v.sku === data.sku)
        if (idx >= 0) {
          const next = [...prev]; next[idx] = data; return next
        }
        return [...prev, data]
      })
      setNewColorName("")
      setNewStock("0")
    } finally {
      setSavingVariant(false)
    }
  }

  const handleVariantStockChange = async (sku: string, newStock: number) => {
    if (!initial) return
    const v = variants.find(v => v.sku === sku)
    if (!v) return
    const res = await fetch("/api/admin/variants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: initial.id,
        sku,
        colorName: v.colorName,
        colorHex: v.colorHex,
        size: v.size,
        stock: newStock,
        active: v.active,
      }),
    })
    const data = await res.json()
    if (!res.ok) { alert("Erro ao atualizar estoque"); return }
    setVariants(prev => prev.map(p => p.sku === sku ? data : p))
  }

  const handleVariantToggle = async (sku: string) => {
    if (!initial) return
    const v = variants.find(v => v.sku === sku)
    if (!v) return
    const res = await fetch("/api/admin/variants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: initial.id,
        sku,
        colorName: v.colorName,
        colorHex: v.colorHex,
        size: v.size,
        stock: v.stock,
        active: !v.active,
      }),
    })
    const data = await res.json()
    if (!res.ok) { alert("Erro ao alterar"); return }
    setVariants(prev => prev.map(p => p.sku === sku ? data : p))
  }

  const handleVariantDelete = async (sku: string) => {
    if (!confirm(`Excluir variante ${sku}?`)) return
    const res = await fetch("/api/admin/variants", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sku }),
    })
    if (!res.ok) { alert("Erro ao excluir"); return }
    setVariants(prev => prev.filter(p => p.sku !== sku))
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-white">
      <header className="border-b border-neutral-800 px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/produtos" className="flex h-7 w-7 items-center justify-center rounded text-neutral-500 hover:bg-neutral-800 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="font-semibold">{isNew ? "Novo produto" : "Editar produto"}</h1>
            {!isNew && initial && (
              <span className="text-[10px] text-neutral-500 font-mono">{initial.id}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {savedFlash && <span className="text-[11px] text-emerald-400">✓ Salvo</span>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex h-8 items-center gap-1.5 rounded bg-emerald-600 px-4 text-[11px] font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {isNew ? "Criar" : "Salvar"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-4 p-4">
        {error && (
          <div className="flex items-start gap-2 rounded border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-400">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dados básicos */}
        <Section title="Básico">
          <Grid>
            <Field label="Nome" required>
              <input value={name} onChange={e => handleNameChange(e.target.value)}
                className={inputCls} placeholder="Camiseta..." />
            </Field>
            <Field label="Status">
              <select value={status} onChange={e => setStatus(e.target.value as ProductStatus)} className={inputCls}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Slug" required hint="Lowercase, com hífens, sem acento">
              <input value={slug} onChange={e => setSlug(e.target.value)}
                className={inputCls} placeholder="camiseta-cristo" />
            </Field>
            <Field label="SKU" required>
              <input value={sku} onChange={e => setSku(e.target.value.toUpperCase())}
                className={inputCls} placeholder="CAM-CRISTO" />
            </Field>
            <Field label="Categoria">
              <select value={category} onChange={e => setCategory(e.target.value as ProductCategory)} className={inputCls}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Badge">
              <select value={badge} onChange={e => setBadge(e.target.value)} className={inputCls}>
                {BADGES.map(b => <option key={b} value={b}>{b || "— sem badge —"}</option>)}
              </select>
            </Field>
          </Grid>
        </Section>

        {/* Preço */}
        <Section title="Preço">
          <Grid>
            <Field label="Preço atual (R$)" required>
              <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
                className={inputCls} placeholder="69.90" />
            </Field>
            <Field label="Preço original (R$)" hint="Deixe vazio se não tiver desconto">
              <input type="number" step="0.01" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)}
                className={inputCls} placeholder="89.90" />
            </Field>
          </Grid>
        </Section>

        {/* Conteúdo */}
        <Section title="Conteúdo">
          <Field label="Descrição">
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={3} className={`${inputCls} font-sans`} placeholder="Camiseta com estampa..." />
          </Field>
          <Field label="Detalhes" hint="Um item por linha">
            <textarea value={details} onChange={e => setDetails(e.target.value)}
              rows={4} className={`${inputCls} font-sans`} placeholder={"100% algodão\nEstampa frente e costas\n..."} />
          </Field>
          <Field label="Tags" hint="Separadas por vírgula">
            <input value={tags} onChange={e => setTags(e.target.value)}
              className={inputCls} placeholder="fé, urbano, estampa" />
          </Field>
        </Section>

        {/* Mídia */}
        <Section title="Mídia">
          {isNew ? (
            <div className="flex items-start gap-2 rounded border border-sky-900/30 bg-sky-950/20 p-3 text-[11px] text-sky-300">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div>
                <p className="font-medium">Salve o produto primeiro</p>
                <p className="mt-0.5 text-[10px] text-sky-400/80">
                  Upload de mídia precisa do ID do produto. Crie o produto sem mídia e
                  adicione imagens/vídeo na próxima tela.
                </p>
              </div>
            </div>
          ) : initial ? (
            <>
              <MediaManager
                productId={initial.id}
                legacyImagesCount={initial.images?.length ?? 0}
              />
              <p className="text-[10px] text-neutral-500">
                💡 Mídia agora é estruturada. Use os badges pra marcar capa/hover/frente/costas/etc.
                Arraste pra reordenar. Capa e Hover só podem ter <strong>uma</strong> imagem cada — trocar uma desmarca a anterior automaticamente.
              </p>
            </>
          ) : null}
        </Section>

        {/* Flags */}
        <Section title="Destaque">
          <div className="flex flex-wrap gap-2">
            <Toggle on={isNew_} onClick={() => setIsNew_(!isNew_)} label="Novidade" />
            <Toggle on={isPromotion} onClick={() => setIsPromotion(!isPromotion)} label="Promoção" />
            <Toggle on={isBestseller} onClick={() => setIsBestseller(!isBestseller)} label="Mais vendida" />
          </div>
        </Section>

        {/* Variantes (só na edição) */}
        {!isNew && initial && (
          <Section title={`Variantes (${variants.length})`}>
            {variants.length > 0 ? (
              <div className="overflow-hidden rounded border border-neutral-800">
                <table className="w-full text-xs">
                  <thead className="bg-neutral-900 text-neutral-500">
                    <tr>
                      <th className="px-3 py-1.5 text-left font-medium">SKU</th>
                      <th className="px-3 py-1.5 text-left font-medium">Cor</th>
                      <th className="px-3 py-1.5 text-left font-medium">Tam.</th>
                      <th className="px-3 py-1.5 text-right font-medium">Estoque</th>
                      <th className="px-3 py-1.5 text-center font-medium">Ativa</th>
                      <th className="px-3 py-1.5 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {variants.map(v => (
                      <tr key={v.sku} className="hover:bg-neutral-900/40">
                        <td className="px-3 py-1.5 font-mono text-[10px] text-neutral-400">{v.sku}</td>
                        <td className="px-3 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="h-3 w-3 rounded border border-neutral-700" style={{ backgroundColor: v.colorHex }} />
                            <span>{v.colorName}</span>
                          </div>
                        </td>
                        <td className="px-3 py-1.5">{v.size}</td>
                        <td className="px-3 py-1.5 text-right">
                          <input
                            type="number"
                            min={0}
                            defaultValue={v.stock}
                            onBlur={e => {
                              const n = parseInt(e.target.value) || 0
                              if (n !== v.stock) handleVariantStockChange(v.sku, n)
                            }}
                            className="w-16 rounded bg-neutral-900 px-2 py-0.5 text-right font-mono text-[11px] outline-none focus:bg-neutral-800"
                          />
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          <button onClick={() => handleVariantToggle(v.sku)} className="text-neutral-400 hover:text-white">
                            {v.active ? <ToggleRight className="h-4 w-4 text-emerald-500" /> : <ToggleLeft className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="px-3 py-1.5 text-right">
                          <button onClick={() => handleVariantDelete(v.sku)} className="text-red-500 hover:text-red-300">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[11px] text-neutral-500">Nenhuma variante. Adicione abaixo.</p>
            )}

            {/* Adicionar variante */}
            <div className="rounded border border-neutral-800 bg-neutral-900/40 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Nova variante</p>
              <div className="flex flex-wrap items-end gap-2">
                <Field label="Cor" small>
                  <input value={newColorName} onChange={e => setNewColorName(e.target.value)}
                    className={inputCls} placeholder="Preto" />
                </Field>
                <Field label="Hex" small>
                  <input type="color" value={newColorHex} onChange={e => setNewColorHex(e.target.value)}
                    className="h-9 w-14 rounded border border-neutral-800 bg-neutral-900" />
                </Field>
                <Field label="Tamanho" small>
                  <select value={newSize} onChange={e => setNewSize(e.target.value as ProductSize)} className={inputCls}>
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Estoque" small>
                  <input type="number" min={0} value={newStock} onChange={e => setNewStock(e.target.value)}
                    className={`${inputCls} w-20`} />
                </Field>
                <button
                  onClick={handleAddVariant}
                  disabled={savingVariant}
                  className="flex h-9 items-center gap-1.5 rounded bg-neutral-700 px-3 text-[11px] hover:bg-neutral-600 disabled:opacity-50"
                >
                  {savingVariant ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                  Adicionar
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-neutral-500">
                SKU será gerado automaticamente: <span className="font-mono text-neutral-400">{sku || "(SKU do produto)"}-{newColorName.toUpperCase().replace(/\s+/g, "-") || "COR"}-{newSize}</span>
              </p>
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

// ===== UI helpers =====

const inputCls = "h-9 w-full rounded border border-neutral-800 bg-neutral-900 px-3 text-xs text-white outline-none focus:border-neutral-600"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/30 p-4">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">{title}</h2>
      {children}
    </section>
  )
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
}
function Field({ label, hint, required, small, children }: {
  label: string; hint?: string; required?: boolean; small?: boolean; children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className={`mb-1 block ${small ? "text-[9px]" : "text-[10px]"} font-medium uppercase tracking-wider text-neutral-400`}>
        {label}{required && <span className="ml-1 text-red-400">*</span>}
      </span>
      {children}
      {hint && <span className="mt-0.5 block text-[10px] text-neutral-600">{hint}</span>}
    </label>
  )
}
function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium ${
        on ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-300" : "border-neutral-700 text-neutral-400"
      }`}
    >
      {on ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
      {label}
    </button>
  )
}
