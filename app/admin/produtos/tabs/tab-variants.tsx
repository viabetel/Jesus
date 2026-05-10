"use client"

import { useState, useMemo } from "react"
import {
  Plus, Trash2, AlertCircle, Loader2, Copy,
} from "lucide-react"
import type { ProductVariant, ProductSize } from "@/lib/data/products"

const ALL_SIZES: ProductSize[] = ["P", "M", "G", "GG"]

type ColorGroup = {
  colorName: string
  colorHex: string
  colorKey: string
  /** Map de size → variant */
  sizeMap: Map<ProductSize, ProductVariant>
}

type StockDetail = {
  sku: string
  stock: number
  reserved: number
  consumed: number
  available: number
}

type Props = {
  productId: string
  productSku: string
  variants: ProductVariant[]
  onVariantsChange: (variants: ProductVariant[]) => void
  stockDetails: Map<string, StockDetail>
}

function makeColorKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
}

/**
 * Grade inteligente cor × tamanho.
 *
 * O operador trabalha com:
 * - Adicionar cor (uma vez, preenche toda a grade P/M/G/GG)
 * - Editar estoque por célula
 * - Zerar estoque de uma cor
 * - Copiar grade de outra cor
 *
 * SKUs são gerados automaticamente: {productSku}-{COR}-{TAM}
 */
export function VariantGrid({ productId, productSku, variants, onVariantsChange, stockDetails }: Props) {
  const [newColorName, setNewColorName] = useState("")
  const [newColorHex, setNewColorHex] = useState("#000000")
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Agrupa variantes por cor
  const colorGroups = useMemo(() => {
    const groups = new Map<string, ColorGroup>()
    for (const v of variants) {
      const key = makeColorKey(v.colorName)
      if (!groups.has(key)) {
        groups.set(key, {
          colorName: v.colorName,
          colorHex: v.colorHex,
          colorKey: key,
          sizeMap: new Map(),
        })
      }
      groups.get(key)!.sizeMap.set(v.size, v)
    }
    return [...groups.values()]
  }, [variants])

  const colors = colorGroups.map(g => g.colorName)

  // ===== Ações =====

  const upsertVariant = async (
    colorName: string, colorHex: string, size: ProductSize, stock: number
  ): Promise<ProductVariant | null> => {
    const colorSlug = makeColorKey(colorName)
    const sku = `${productSku}-${colorSlug.toUpperCase()}-${size}`
    try {
      const res = await fetch("/api/admin/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId, sku, colorName, colorHex, size, stock, active: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error?.message ?? "Erro ao salvar variante")
        return null
      }
      return data as ProductVariant
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro de rede")
      return null
    }
  }

  const handleAddColor = async () => {
    const name = newColorName.trim()
    if (!name) { setError("Nome da cor obrigatório"); return }
    const key = makeColorKey(name)
    if (colorGroups.some(g => g.colorKey === key)) {
      setError(`Cor "${name}" já existe`); return
    }
    if (!productSku) { setError("Defina o SKU base do produto antes de adicionar cores"); return }

    setError(null)
    setSaving("adding-color")

    // Criar P, M, G, GG com estoque 0
    const newVariants: ProductVariant[] = []
    for (const size of ALL_SIZES) {
      const v = await upsertVariant(name, newColorHex, size, 0)
      if (v) newVariants.push(v)
    }

    if (newVariants.length > 0) {
      onVariantsChange([...variants, ...newVariants])
      setNewColorName("")
      setNewColorHex("#000000")
    }
    setSaving(null)
  }

  const handleStockChange = async (sku: string, newStock: number) => {
    const v = variants.find(vv => vv.sku === sku)
    if (!v) return
    setSaving(sku)
    const result = await upsertVariant(v.colorName, v.colorHex, v.size, newStock)
    if (result) {
      onVariantsChange(variants.map(vv => vv.sku === sku ? result : vv))
    }
    setSaving(null)
  }

  const handleZeroColor = async (colorKey: string) => {
    const group = colorGroups.find(g => g.colorKey === colorKey)
    if (!group) return
    if (!confirm(`Zerar estoque de todas as variantes ${group.colorName}?`)) return
    setSaving(`zero-${colorKey}`)
    const updated = [...variants]
    for (const [size, v] of group.sizeMap) {
      if (v.stock > 0) {
        const result = await upsertVariant(v.colorName, v.colorHex, size, 0)
        if (result) {
          const idx = updated.findIndex(u => u.sku === v.sku)
          if (idx >= 0) updated[idx] = result
        }
      }
    }
    onVariantsChange(updated)
    setSaving(null)
  }

  const handleCopyColor = async (fromKey: string) => {
    const fromGroup = colorGroups.find(g => g.colorKey === fromKey)
    if (!fromGroup) return
    const targetName = prompt(`Copiar grade de "${fromGroup.colorName}" para qual cor?\n\nDigite o nome da nova cor:`)
    if (!targetName?.trim()) return
    const name = targetName.trim()
    const key = makeColorKey(name)
    if (colorGroups.some(g => g.colorKey === key)) {
      setError(`Cor "${name}" já existe`); return
    }

    setSaving(`copy-${fromKey}`)
    const hex = fromGroup.colorHex
    const newVariants: ProductVariant[] = []
    for (const size of ALL_SIZES) {
      const fromV = fromGroup.sizeMap.get(size)
      const stock = fromV?.stock ?? 0
      const v = await upsertVariant(name, hex, size, stock)
      if (v) newVariants.push(v)
    }
    if (newVariants.length > 0) {
      onVariantsChange([...variants, ...newVariants])
    }
    setSaving(null)
  }

  const handleDeleteColor = async (colorKey: string) => {
    const group = colorGroups.find(g => g.colorKey === colorKey)
    if (!group) return
    if (!confirm(`Excluir TODAS as variantes de ${group.colorName}?\n\nIsso remove ${group.sizeMap.size} variantes permanentemente.`)) return
    setSaving(`delete-${colorKey}`)
    for (const [, v] of group.sizeMap) {
      await fetch("/api/admin/variants", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: v.sku }),
      }).catch(() => {})
    }
    onVariantsChange(variants.filter(v => makeColorKey(v.colorName) !== colorKey))
    setSaving(null)
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/30 p-2.5 text-[11px] text-red-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-300 hover:text-red-100">×</button>
        </div>
      )}

      {/* ===== GRADE COR × TAMANHO ===== */}
      {colorGroups.length > 0 ? (
        <div className="space-y-3">
          {/* Cabeçalho da grade */}
          <div className="overflow-x-auto rounded-lg border border-neutral-800">
            <table className="w-full min-w-[500px] text-xs">
              <thead>
                <tr className="bg-neutral-900 text-neutral-500">
                  <th className="px-3 py-2 text-left font-medium">Cor</th>
                  {ALL_SIZES.map(s => (
                    <th key={s} className="px-3 py-2 text-center font-medium w-20">{s}</th>
                  ))}
                  <th className="px-3 py-2 text-right font-medium w-20">Total</th>
                  <th className="px-3 py-2 text-right font-medium w-24">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {colorGroups.map(group => {
                  const totalStock = ALL_SIZES.reduce((sum, s) => {
                    const v = group.sizeMap.get(s)
                    const sd = v ? stockDetails.get(v.sku) : null
                    return sum + (sd?.available ?? v?.stock ?? 0)
                  }, 0)

                  return (
                    <tr key={group.colorKey} className="hover:bg-neutral-900/30">
                      {/* Cor */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-5 w-5 shrink-0 rounded border border-neutral-700"
                            style={{ backgroundColor: group.colorHex }}
                          />
                          <span className="font-medium">{group.colorName}</span>
                        </div>
                      </td>

                      {/* Estoque por tamanho */}
                      {ALL_SIZES.map(size => {
                        const v = group.sizeMap.get(size)
                        const sd = v ? stockDetails.get(v.sku) : null
                        const available = sd?.available ?? v?.stock ?? 0
                        const hasReservation = (sd?.reserved ?? 0) > 0

                        return (
                          <td key={size} className="px-1 py-1.5 text-center">
                            {v ? (
                              <div className="relative">
                                <input
                                  type="number"
                                  min={0}
                                  defaultValue={v.stock}
                                  onBlur={e => {
                                    const n = parseInt(e.target.value) || 0
                                    if (n !== v.stock) handleStockChange(v.sku, n)
                                  }}
                                  className={`w-full rounded px-1.5 py-1 text-center font-mono text-[11px] outline-none transition ${
                                    available === 0
                                      ? "bg-red-950/40 text-red-400 border border-red-800/50"
                                      : hasReservation
                                      ? "bg-amber-950/30 text-amber-300 border border-amber-800/40"
                                      : "bg-neutral-900 text-neutral-200 border border-neutral-800 focus:border-neutral-600"
                                  }`}
                                  disabled={saving === v.sku}
                                />
                                {/* Tooltip com detalhes */}
                                {sd && (sd.reserved > 0 || sd.consumed > 0) && (
                                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-neutral-800 px-1.5 py-0.5 text-[8px] text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                                    Res:{sd.reserved} Vend:{sd.consumed} Disp:{available}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-neutral-600">—</span>
                            )}
                          </td>
                        )
                      })}

                      {/* Total disponível */}
                      <td className={`px-3 py-2 text-right font-mono text-[11px] font-semibold ${
                        totalStock === 0 ? "text-red-400" : "text-emerald-400"
                      }`}>
                        {totalStock}
                      </td>

                      {/* Ações */}
                      <td className="px-2 py-1.5 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            onClick={() => handleCopyColor(group.colorKey)}
                            className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
                            title="Copiar grade pra nova cor"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleZeroColor(group.colorKey)}
                            className="rounded p-1 text-amber-500 hover:bg-amber-950/40"
                            title="Zerar estoque desta cor"
                          >
                            <AlertCircle className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteColor(group.colorKey)}
                            className="rounded p-1 text-red-500 hover:bg-red-950/40"
                            title="Excluir cor e variantes"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-3 text-[9px] text-neutral-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded bg-neutral-900 border border-neutral-800" /> Normal
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded bg-amber-950/30 border border-amber-800/40" /> Com reserva
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded bg-red-950/40 border border-red-800/50" /> Esgotado
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-neutral-700 bg-neutral-900/20 py-8 text-center">
          <p className="text-sm text-neutral-400">Nenhuma cor cadastrada</p>
          <p className="mt-1 text-[10px] text-neutral-600">
            Adicione uma cor abaixo e o sistema cria automaticamente variantes P, M, G, GG.
          </p>
        </div>
      )}

      {/* ===== ADICIONAR COR ===== */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-3.5">
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          Adicionar cor
        </p>
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block text-[9px] font-medium uppercase tracking-wider text-neutral-400">
              Nome da cor
            </label>
            <input
              value={newColorName}
              onChange={e => setNewColorName(e.target.value)}
              placeholder="Ex: Preto, Azul Royal, Off White"
              className="h-9 w-full rounded border border-neutral-800 bg-neutral-900 px-3 text-xs text-white outline-none focus:border-neutral-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-[9px] font-medium uppercase tracking-wider text-neutral-400">
              Cor
            </label>
            <input
              type="color"
              value={newColorHex}
              onChange={e => setNewColorHex(e.target.value)}
              className="h-9 w-14 rounded border border-neutral-800 bg-neutral-900 cursor-pointer"
            />
          </div>
          <button
            onClick={handleAddColor}
            disabled={saving === "adding-color" || !newColorName.trim()}
            className="flex h-9 items-center gap-1.5 rounded bg-emerald-600 px-4 text-[11px] font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving === "adding-color"
              ? <Loader2 className="h-3 w-3 animate-spin" />
              : <Plus className="h-3 w-3" />}
            Adicionar cor (gera P/M/G/GG)
          </button>
        </div>
        {productSku && newColorName.trim() && (
          <p className="mt-2 text-[10px] text-neutral-500">
            SKUs: <span className="font-mono text-neutral-400">
              {ALL_SIZES.map(s => `${productSku}-${makeColorKey(newColorName).toUpperCase()}-${s}`).join(", ")}
            </span>
          </p>
        )}
      </div>

      {/* Resumo */}
      {colorGroups.length > 0 && (
        <p className="text-[10px] text-neutral-500">
          {colorGroups.length} cor(es) · {variants.length} variantes ·{" "}
          {variants.filter(v => v.active).reduce((s, v) => {
            const sd = stockDetails.get(v.sku)
            return s + (sd?.available ?? v.stock)
          }, 0)} unidades disponíveis
        </p>
      )}
    </div>
  )
}
