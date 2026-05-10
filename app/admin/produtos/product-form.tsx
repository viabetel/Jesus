"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Save, ArrowLeft, AlertCircle, Loader2, Check, CheckCircle,
  ToggleLeft, ToggleRight, Info, Plus, Trash2,
} from "lucide-react"
import type {
  Product, ProductCategory, ProductStatus, ProductSize, ProductBadge, ProductVariant,
} from "@/lib/data/products"
import { MediaManager } from "@/components/admin/media-manager"
import { getPublishChecklist, type ChecklistInput } from "@/lib/services/publish-checklist"
import { VariantGrid } from "./tabs/tab-variants"

// ===== Constants =====
const CATEGORIES: ProductCategory[] = [
  "Camisetas", "Oversized", "Baby Look", "Moletons", "Acessórios",
]
const STATUSES: ProductStatus[] = ["ativo", "rascunho", "oculto", "esgotado"]
const BADGES: (ProductBadge | "")[] = [
  "", "Novidade", "Promoção", "Lançamento", "Mais vendida",
  "Últimas unidades", "Esgotado", "Disponível",
]

type TabId = "basico" | "comercial" | "variantes" | "midia" | "conteudo" | "publicacao"

const TABS: { id: TabId; label: string }[] = [
  { id: "basico", label: "Básico" },
  { id: "comercial", label: "Comercial" },
  { id: "variantes", label: "Variações" },
  { id: "midia", label: "Mídia" },
  { id: "conteudo", label: "Conteúdo" },
  { id: "publicacao", label: "Publicação" },
]

export function ProductForm({ initial }: { initial: Product | null }) {
  const router = useRouter()
  const isNew = !initial
  const [activeTab, setActiveTab] = useState<TabId>("basico")

  // ===== States do produto =====
  const [name, setName] = useState(initial?.name ?? "")
  const [slug, setSlug] = useState(initial?.slug ?? "")
  const [sku, setSku] = useState(initial?.sku ?? "")
  const [category, setCategory] = useState<ProductCategory>(initial?.category ?? "Camisetas")
  const [status, setStatus] = useState<ProductStatus>(initial?.status ?? "rascunho")
  const [price, setPrice] = useState(initial?.price?.toString() ?? "")
  const [originalPrice, setOriginalPrice] = useState(initial?.originalPrice?.toString() ?? "")
  const [badge, setBadge] = useState<string>(initial?.badge ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [details, setDetails] = useState(initial?.details?.join("\n") ?? "")
  const [tags, setTags] = useState(initial?.tags?.join(", ") ?? "")
  const [composition, setComposition] = useState(initial?.composition ?? "")
  const [fit, setFit] = useState(initial?.fit ?? "")
  const [care, setCare] = useState(Array.isArray(initial?.care) ? initial.care.join("\n") : "")
  const [sizeGuide, setSizeGuide] = useState(
    initial?.sizeGuide?.map(sg => `${sg.size}, ${sg.width}, ${sg.length}`).join("\n") ?? ""
  )
  const [isNew_, setIsNew_] = useState(initial?.isNew ?? false)
  const [isPromotion, setIsPromotion] = useState(initial?.isPromotion ?? false)
  const [isBestseller, setIsBestseller] = useState(initial?.isBestseller ?? false)

  // Variantes
  const [variants, setVariants] = useState<ProductVariant[]>(initial?.variants ?? [])

  // Stock details
  type StockDetail = { sku: string; stock: number; reserved: number; consumed: number; available: number }
  const [stockDetails, setStockDetails] = useState<Map<string, StockDetail>>(new Map())

  // Mídia estruturada (pra checklist)
  const [structuredMedia, setStructuredMedia] = useState<{ role: string; kind: string }[]>([])

  // UI state
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)

  // Fetch stock + mídia na montagem
  useEffect(() => {
    if (!initial) return
    fetch(`/api/admin/products/${initial.id}/stock`)
      .then(r => r.ok ? r.json() : null)
      .then((data: { balances?: StockDetail[] } | null) => {
        if (!data?.balances) return
        const map = new Map<string, StockDetail>()
        for (const d of data.balances) map.set(d.sku, d)
        setStockDetails(map)
      })
      .catch(() => {})
    fetch(`/api/admin/products/${initial.id}/media`)
      .then(r => r.ok ? r.json() : [])
      .then((data: { role?: string; kind?: string }[]) => {
        if (Array.isArray(data)) {
          setStructuredMedia(data.map(m => ({ role: m.role ?? "gallery", kind: m.kind ?? "image" })))
        }
      })
      .catch(() => {})
  }, [initial]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // ===== SAVE =====
  const handleSave = async () => {
    setError(null)
    const priceNum = parseFloat(price)
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError("Preço inválido"); setActiveTab("comercial"); return
    }
    const origPriceNum = originalPrice ? parseFloat(originalPrice) : null
    if (origPriceNum != null && origPriceNum <= priceNum) {
      setError("Preço original deve ser maior que o preço atual"); setActiveTab("comercial"); return
    }
    if (!name.trim()) { setError("Nome obrigatório"); setActiveTab("basico"); return }
    if (!slug.trim()) { setError("Slug obrigatório"); setActiveTab("basico"); return }
    if (!sku.trim()) { setError("SKU obrigatório"); setActiveTab("basico"); return }

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
      tags: tags.split(",").map(s => s.trim()).filter(Boolean),
      isNew: isNew_,
      isPromotion,
      isBestseller,
      composition: composition.trim() || null,
      fit: fit.trim() || null,
      care: care.split("\n").map(s => s.trim()).filter(Boolean),
      sizeGuide: sizeGuide.split("\n").map(line => {
        const parts = line.split(",").map(s => s.trim())
        if (parts.length >= 3) return { size: parts[0], width: parts[1], length: parts[2] }
        return null
      }).filter((x): x is { size: string; width: string; length: string } => x !== null),
    }

    setSaving(true)
    try {
      const url = isNew ? "/api/admin/products" : `/api/admin/products/${initial!.id}`
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

  // ===== Checklist data =====
  const checklistProduct: ChecklistInput = {
    ...(initial ?? { id: "", slug: "", sku: "", images: [], variants: [] }),
    name, slug, sku, category, price: parseFloat(price) || 0,
    description, images: initial?.images ?? [],
    variants, composition, care: care.split("\n").filter(Boolean),
    structuredMedia,
    status: status as ProductStatus,
    badge: badge as ProductBadge | undefined,
    originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
    details: details.split("\n").filter(Boolean),
    tags: tags.split(",").map(s => s.trim()).filter(Boolean),
  } as ChecklistInput

  return (
    <div className="min-h-dvh bg-neutral-950 text-white">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/produtos" className="flex h-7 w-7 items-center justify-center rounded text-neutral-500 hover:bg-neutral-800 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-sm font-semibold">{isNew ? "Novo produto" : name || "Editar produto"}</h1>
              {!isNew && initial && (
                <span className="text-[9px] text-neutral-500 font-mono">{initial.id}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {savedFlash && <span className="text-[11px] text-emerald-400 animate-pulse">✓ Salvo</span>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-[11px] font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {isNew ? "Criar produto" : "Salvar"}
            </button>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div className="mx-auto max-w-6xl px-4">
          <nav className="-mb-px flex gap-0 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 border-b-2 px-4 py-2 text-[11px] font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ===== ERROR ===== */}
      <div className="mx-auto max-w-6xl px-4 pt-4">
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-400">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-300 hover:text-red-100">×</button>
          </div>
        )}
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className="mx-auto max-w-6xl px-4 pb-16">
        {/* --- TAB: BÁSICO --- */}
        {activeTab === "basico" && (
          <div className="space-y-4 pt-2">
            <Section title="Identificação">
              <Grid>
                <Field label="Nome" required>
                  <input value={name} onChange={e => handleNameChange(e.target.value)} className={inputCls} placeholder="Camiseta..." />
                </Field>
                <Field label="Status">
                  <select value={status} onChange={e => setStatus(e.target.value as ProductStatus)} className={inputCls}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Slug" required hint="Lowercase, hífens, sem acento">
                  <input value={slug} onChange={e => setSlug(e.target.value)} className={inputCls} placeholder="camiseta-cristo" />
                </Field>
                <Field label="SKU base" required hint="Usado na geração de SKUs das variantes">
                  <input value={sku} onChange={e => setSku(e.target.value.toUpperCase())} className={inputCls} placeholder="CAM-CRISTO" />
                </Field>
                <Field label="Categoria">
                  <select value={category} onChange={e => setCategory(e.target.value as ProductCategory)} className={inputCls}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Tags" hint="Separadas por vírgula">
                  <input value={tags} onChange={e => setTags(e.target.value)} className={inputCls} placeholder="fé, urbano, estampa" />
                </Field>
              </Grid>
            </Section>
            <Section title="Descrição">
              <Field label="Descrição do produto">
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={`${inputCls} font-sans`} placeholder="Camiseta com estampa..." />
              </Field>
              <Field label="Detalhes" hint="Um item por linha">
                <textarea value={details} onChange={e => setDetails(e.target.value)} rows={4} className={`${inputCls} font-sans`} placeholder={"100% algodão\nEstampa frente e costas"} />
              </Field>
            </Section>
          </div>
        )}

        {/* --- TAB: COMERCIAL --- */}
        {activeTab === "comercial" && (
          <div className="space-y-4 pt-2">
            <Section title="Preço">
              <Grid>
                <Field label="Preço atual (R$)" required>
                  <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className={inputCls} placeholder="69.90" />
                </Field>
                <Field label="Preço original (R$)" hint="Deixe vazio se não tiver desconto">
                  <input type="number" step="0.01" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className={inputCls} placeholder="89.90" />
                </Field>
              </Grid>
            </Section>
            <Section title="Badges e destaques">
              <Grid>
                <Field label="Badge">
                  <select value={badge} onChange={e => setBadge(e.target.value)} className={inputCls}>
                    {BADGES.map(b => <option key={b} value={b}>{b || "— sem badge —"}</option>)}
                  </select>
                </Field>
              </Grid>
              <div className="flex flex-wrap gap-2 mt-2">
                <Toggle on={isNew_} onClick={() => setIsNew_(!isNew_)} label="Novidade" />
                <Toggle on={isPromotion} onClick={() => setIsPromotion(!isPromotion)} label="Promoção" />
                <Toggle on={isBestseller} onClick={() => setIsBestseller(!isBestseller)} label="Mais vendida" />
              </div>
            </Section>
          </div>
        )}

        {/* --- TAB: VARIAÇÕES / GRADE --- */}
        {activeTab === "variantes" && (
          <div className="pt-2">
            {isNew ? (
              <div className="flex items-start gap-2 rounded-lg border border-sky-900/30 bg-sky-950/20 p-4 text-[11px] text-sky-300">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Salve o produto primeiro</p>
                  <p className="mt-1 text-[10px] text-sky-400/80">
                    A grade de variantes precisa do ID e SKU do produto. Crie o produto na aba Básico e depois volte aqui pra adicionar cores e tamanhos.
                  </p>
                </div>
              </div>
            ) : initial ? (
              <VariantGrid
                productId={initial.id}
                productSku={sku}
                variants={variants}
                onVariantsChange={setVariants}
                stockDetails={stockDetails}
              />
            ) : null}
          </div>
        )}

        {/* --- TAB: MÍDIA --- */}
        {activeTab === "midia" && (
          <div className="pt-2">
            {isNew ? (
              <div className="flex items-start gap-2 rounded-lg border border-sky-900/30 bg-sky-950/20 p-4 text-[11px] text-sky-300">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Salve o produto primeiro</p>
                  <p className="mt-1 text-[10px] text-sky-400/80">
                    Upload de mídia precisa do ID do produto.
                  </p>
                </div>
              </div>
            ) : initial ? (
              <MediaManager
                productId={initial.id}
                legacyImagesCount={initial.images?.length ?? 0}
                onMediaChange={(mediaList) => {
                  setStructuredMedia(mediaList.map(m => ({ role: m.role, kind: m.kind })))
                }}
                availableColors={(() => {
                  const seen = new Map<string, { key: string; name: string; hex: string }>()
                  for (const v of variants) {
                    const key = v.colorName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toLowerCase()
                    if (!seen.has(key)) seen.set(key, { key, name: v.colorName, hex: v.colorHex })
                  }
                  return [...seen.values()]
                })()}
              />
            ) : null}
          </div>
        )}

        {/* --- TAB: CONTEÚDO DA PEÇA --- */}
        {activeTab === "conteudo" && (
          <div className="space-y-4 pt-2">
            <Section title="Material e modelagem">
              <Grid>
                <Field label="Composição / Material" hint="Ex: 100% algodão penteado 30.1">
                  <input value={composition} onChange={e => setComposition(e.target.value)} className={inputCls} placeholder="100% algodão penteado 30.1" />
                </Field>
                <Field label="Modelagem / Fit" hint="Ex: Regular fit, gola redonda">
                  <input value={fit} onChange={e => setFit(e.target.value)} className={inputCls} placeholder="Regular fit, gola redonda" />
                </Field>
              </Grid>
            </Section>
            <Section title="Cuidados">
              <Field label="Instruções de lavagem" hint="Uma instrução por linha">
                <textarea value={care} onChange={e => setCare(e.target.value)} rows={5} className={`${inputCls} font-sans`}
                  placeholder={"Lavar à máquina (30°C)\nNão usar alvejante\nSecar à sombra\nPassar em temperatura média"} />
              </Field>
            </Section>
            <Section title="Guia de medidas">
              <Field label="Tabela de medidas" hint="Formato: TAMANHO, LARGURA, COMPRIMENTO (uma linha por tamanho)">
                <textarea value={sizeGuide} onChange={e => setSizeGuide(e.target.value)} rows={5} className={`${inputCls} font-mono text-[10px]`}
                  placeholder={"P, 50cm, 68cm\nM, 52cm, 70cm\nG, 54cm, 72cm\nGG, 58cm, 74cm"} />
              </Field>
              {/* Preview do guia */}
              {sizeGuide.trim() && (
                <div className="mt-2">
                  <p className="mb-1.5 text-[9px] font-medium uppercase tracking-wider text-neutral-500">Preview</p>
                  <table className="w-full text-[11px] border border-neutral-800 rounded overflow-hidden">
                    <thead className="bg-neutral-900 text-neutral-500">
                      <tr><th className="px-3 py-1.5 text-left font-medium">Tam</th><th className="px-3 py-1.5 text-left font-medium">Largura</th><th className="px-3 py-1.5 text-left font-medium">Comprimento</th></tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {sizeGuide.split("\n").filter(l => l.trim()).map((line, i) => {
                        const parts = line.split(",").map(s => s.trim())
                        return (
                          <tr key={i}><td className="px-3 py-1 font-medium">{parts[0]}</td><td className="px-3 py-1 text-neutral-400">{parts[1] ?? ""}</td><td className="px-3 py-1 text-neutral-400">{parts[2] ?? ""}</td></tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          </div>
        )}

        {/* --- TAB: PUBLICAÇÃO --- */}
        {activeTab === "publicacao" && (
          <div className="space-y-4 pt-2">
            {!isNew && initial && (
              <PublishChecklist product={checklistProduct} />
            )}
            <Section title="Ações">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setStatus("ativo"); handleSave() }}
                  disabled={saving}
                  className="flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-[11px] font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Publicar (ativar)
                </button>
                <button
                  onClick={() => { setStatus("rascunho"); handleSave() }}
                  disabled={saving}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-neutral-700 px-4 text-[11px] font-medium text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
                >
                  Salvar como rascunho
                </button>
                <button
                  onClick={() => { setStatus("oculto"); handleSave() }}
                  disabled={saving}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-neutral-700 px-4 text-[11px] font-medium text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
                >
                  Ocultar
                </button>
                {!isNew && initial && (
                  <Link href={`/produto/${slug}`} target="_blank"
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-neutral-700 px-4 text-[11px] font-medium text-neutral-300 hover:bg-neutral-800">
                    Ver no site →
                  </Link>
                )}
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  )
}

// ===== UI Helpers =====

const inputCls = "h-9 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-xs text-white outline-none focus:border-neutral-600 transition-colors"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/20 p-4">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">{title}</h2>
      {children}
    </section>
  )
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
}
function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-neutral-400">
        {label}{required && <span className="ml-1 text-red-400">*</span>}
      </span>
      {children}
      {hint && <span className="mt-0.5 block text-[10px] text-neutral-600">{hint}</span>}
    </label>
  )
}
function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium transition ${
        on ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-300" : "border-neutral-700 text-neutral-400"
      }`}
    >
      {on ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
      {label}
    </button>
  )
}

function PublishChecklist({ product }: { product: ChecklistInput }) {
  const checks = getPublishChecklist(product)
  const allRequired = checks.filter(c => c.required)
  const passedRequired = allRequired.filter(c => c.passed)
  const ready = passedRequired.length === allRequired.length

  return (
    <Section title={`Checklist de publicação (${passedRequired.length}/${allRequired.length})`}>
      {ready ? (
        <div className="flex items-center gap-2 text-[11px] text-emerald-400">
          <CheckCircle className="h-4 w-4" /> Produto pronto para ser ativado.
        </div>
      ) : (
        <div className="flex items-center gap-2 text-[11px] text-amber-400">
          <AlertCircle className="h-4 w-4" /> Itens obrigatórios faltando. Não será possível ativar.
        </div>
      )}
      <ul className="mt-2 space-y-1">
        {checks.map(c => (
          <li key={c.id} className={`flex items-center gap-2 text-[11px] ${c.passed ? "text-neutral-400" : c.required ? "text-red-400" : "text-neutral-500"}`}>
            {c.passed
              ? <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-900/40 text-emerald-400"><Check className="h-2.5 w-2.5" /></span>
              : <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-800 text-neutral-500">·</span>}
            {c.label}
            {!c.required && !c.passed && <span className="text-[9px] text-neutral-600">(opcional)</span>}
          </li>
        ))}
      </ul>
    </Section>
  )
}
