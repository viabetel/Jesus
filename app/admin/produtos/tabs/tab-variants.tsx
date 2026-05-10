"use client"

import { useState, useMemo } from "react"
import {
  Plus, Trash2, AlertCircle, Loader2, Copy, Edit2,
  ToggleLeft, ToggleRight, Star, X,
} from "lucide-react"
import type { ProductVariant, ProductSize } from "@/lib/data/products"

const DEFAULT_SIZES: ProductSize[] = ["P", "M", "G", "GG"]

type ColorGroup = {
  colorName: string
  colorHex: string
  colorKey: string
  sizeMap: Map<string, ProductVariant>
}

type StockDetail = {
  sku: string; stock: number; reserved: number; consumed: number; available: number
}

type Props = {
  productId: string
  productSku: string
  variants: ProductVariant[]
  onVariantsChange: (variants: ProductVariant[]) => void
  stockDetails: Map<string, StockDetail>
}

function makeColorKey(name: string): string {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toLowerCase()
}

export function VariantGrid({ productId, productSku, variants, onVariantsChange, stockDetails }: Props) {
  const [newColorName, setNewColorName] = useState("")
  const [newColorHex, setNewColorHex] = useState("#000000")
  const [newSizeName, setNewSizeName] = useState("")
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingColor, setEditingColor] = useState<string | null>(null)
  const [editColorName, setEditColorName] = useState("")
  const [editColorHex, setEditColorHex] = useState("")

  // Tamanhos ativos (derivados das variantes existentes + defaults)
  const activeSizes = useMemo(() => {
    const fromVariants = new Set(variants.map(v => v.size))
    const all = [...DEFAULT_SIZES]
    for (const s of fromVariants) {
      if (!all.includes(s as ProductSize)) all.push(s as ProductSize)
    }
    return all
  }, [variants])

  // Agrupa variantes por cor
  const colorGroups = useMemo(() => {
    const groups = new Map<string, ColorGroup>()
    for (const v of variants) {
      const key = makeColorKey(v.colorName)
      if (!groups.has(key)) {
        groups.set(key, { colorName: v.colorName, colorHex: v.colorHex, colorKey: key, sizeMap: new Map() })
      }
      groups.get(key)!.sizeMap.set(v.size, v)
    }
    return [...groups.values()]
  }, [variants])

  // ===== API helper =====
  const upsertVariant = async (
    colorName: string, colorHex: string, size: string, stock: number, active: boolean = true
  ): Promise<ProductVariant | null> => {
    const colorSlug = makeColorKey(colorName).toUpperCase()
    const sku = `${productSku}-${colorSlug}-${size}`
    try {
      const res = await fetch("/api/admin/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, sku, colorName, colorHex, size, stock, active }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error?.message ?? "Erro"); return null }
      return data as ProductVariant
    } catch (e) { setError(e instanceof Error ? e.message : "Erro"); return null }
  }

  // ===== Adicionar cor =====
  const handleAddColor = async () => {
    const name = newColorName.trim()
    if (!name) { setError("Nome da cor obrigatório"); return }
    if (colorGroups.some(g => g.colorKey === makeColorKey(name))) { setError(`Cor "${name}" já existe`); return }
    if (!productSku) { setError("Defina o SKU base antes"); return }

    setError(null)
    setSaving("adding-color")
    const newVars: ProductVariant[] = []
    for (const size of activeSizes) {
      const v = await upsertVariant(name, newColorHex, size, 0)
      if (v) newVars.push(v)
    }
    if (newVars.length > 0) {
      onVariantsChange([...variants, ...newVars])
      setNewColorName("")
      setNewColorHex("#000000")
    }
    setSaving(null)
  }

  // ===== Adicionar tamanho custom =====
  const handleAddSize = async () => {
    const size = newSizeName.trim().toUpperCase()
    if (!size) { setError("Nome do tamanho obrigatório"); return }
    if (activeSizes.includes(size as ProductSize)) { setError(`Tamanho "${size}" já existe`); return }

    setSaving("adding-size")
    const newVars: ProductVariant[] = []
    for (const group of colorGroups) {
      const v = await upsertVariant(group.colorName, group.colorHex, size, 0)
      if (v) newVars.push(v)
    }
    if (newVars.length > 0) onVariantsChange([...variants, ...newVars])
    setNewSizeName("")
    setSaving(null)
  }

  // ===== Editar estoque =====
  const handleStockChange = async (sku: string, newStock: number) => {
    const v = variants.find(vv => vv.sku === sku)
    if (!v) return
    setSaving(sku)
    const result = await upsertVariant(v.colorName, v.colorHex, v.size, newStock, v.active)
    if (result) onVariantsChange(variants.map(vv => vv.sku === sku ? result : vv))
    setSaving(null)
  }

  // ===== Toggle ativar/inativar variante individual =====
  const handleToggleVariant = async (sku: string) => {
    const v = variants.find(vv => vv.sku === sku)
    if (!v) return
    setSaving(sku)
    const result = await upsertVariant(v.colorName, v.colorHex, v.size, v.stock, !v.active)
    if (result) onVariantsChange(variants.map(vv => vv.sku === sku ? result : vv))
    setSaving(null)
  }

  // ===== Inativar/ativar cor inteira =====
  const handleToggleColor = async (colorKey: string) => {
    const group = colorGroups.find(g => g.colorKey === colorKey)
    if (!group) return
    const allActive = [...group.sizeMap.values()].every(v => v.active)
    const newActive = !allActive
    setSaving(`toggle-${colorKey}`)
    const updated = [...variants]
    for (const [, v] of group.sizeMap) {
      if (v.active !== newActive) {
        const result = await upsertVariant(v.colorName, v.colorHex, v.size, v.stock, newActive)
        if (result) {
          const idx = updated.findIndex(u => u.sku === v.sku)
          if (idx >= 0) updated[idx] = result
        }
      }
    }
    onVariantsChange(updated)
    setSaving(null)
  }

  // ===== Editar nome/hex da cor =====
  const handleSaveColorEdit = async (oldKey: string) => {
    const newName = editColorName.trim()
    const newHex = editColorHex
    if (!newName) { setError("Nome obrigatório"); return }
    const group = colorGroups.find(g => g.colorKey === oldKey)
    if (!group) return

    setSaving(`edit-${oldKey}`)
    const updated = [...variants]
    for (const [, v] of group.sizeMap) {
      // Recrear com novo nome/hex (SKU muda se nome mudar)
      const newColorSlug = makeColorKey(newName).toUpperCase()
      const newSku = `${productSku}-${newColorSlug}-${v.size}`

      // Deleta o antigo se SKU mudou
      if (v.sku !== newSku) {
        await fetch("/api/admin/variants", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sku: v.sku }),
        }).catch(() => {})
      }

      const result = await upsertVariant(newName, newHex, v.size, v.stock, v.active)
      if (result) {
        const idx = updated.findIndex(u => u.sku === v.sku)
        if (idx >= 0) updated[idx] = result
        else updated.push(result)
      }
    }
    // Remove variantes que foram deletadas (SKU antigo)
    const validSkus = new Set(updated.filter(v => makeColorKey(v.colorName) === makeColorKey(newName)).map(v => v.sku))
    const cleaned = updated.filter(v => makeColorKey(v.colorName) !== oldKey || validSkus.has(v.sku))
    onVariantsChange(cleaned)
    setEditingColor(null)
    setSaving(null)
  }

  // ===== Zerar estoque =====
  const handleZeroColor = async (colorKey: string) => {
    const group = colorGroups.find(g => g.colorKey === colorKey)
    if (!group || !confirm(`Zerar estoque de ${group.colorName}?`)) return
    setSaving(`zero-${colorKey}`)
    const updated = [...variants]
    for (const [, v] of group.sizeMap) {
      if (v.stock > 0) {
        const result = await upsertVariant(v.colorName, v.colorHex, v.size, 0, v.active)
        if (result) { const idx = updated.findIndex(u => u.sku === v.sku); if (idx >= 0) updated[idx] = result }
      }
    }
    onVariantsChange(updated)
    setSaving(null)
  }

  // ===== Copiar grade =====
  const handleCopyColor = async (fromKey: string) => {
    const from = colorGroups.find(g => g.colorKey === fromKey)
    if (!from) return
    const name = prompt(`Copiar grade de "${from.colorName}" para qual cor?`)
    if (!name?.trim()) return
    if (colorGroups.some(g => g.colorKey === makeColorKey(name))) { setError(`Cor "${name}" já existe`); return }
    setSaving(`copy-${fromKey}`)
    const newVars: ProductVariant[] = []
    for (const size of activeSizes) {
      const fromV = from.sizeMap.get(size)
      const v = await upsertVariant(name.trim(), from.colorHex, size, fromV?.stock ?? 0)
      if (v) newVars.push(v)
    }
    if (newVars.length > 0) onVariantsChange([...variants, ...newVars])
    setSaving(null)
  }

  // ===== Excluir cor =====
  const handleDeleteColor = async (colorKey: string) => {
    const group = colorGroups.find(g => g.colorKey === colorKey)
    if (!group || !confirm(`Excluir ${group.colorName} e todas as variantes?`)) return
    setSaving(`delete-${colorKey}`)
    for (const [, v] of group.sizeMap) {
      await fetch("/api/admin/variants", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sku: v.sku }) }).catch(() => {})
    }
    onVariantsChange(variants.filter(v => makeColorKey(v.colorName) !== colorKey))
    setSaving(null)
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/30 p-2.5 text-[11px] text-red-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-3 w-3" /></button>
        </div>
      )}

      {/* ===== GRADE ===== */}
      {colorGroups.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-neutral-800">
          <table className="w-full min-w-[520px] text-xs">
            <thead>
              <tr className="bg-neutral-900 text-neutral-500">
                <th className="px-3 py-2 text-left font-medium">Cor</th>
                {activeSizes.map(s => <th key={s} className="px-2 py-2 text-center font-medium w-16">{s}</th>)}
                <th className="px-2 py-2 text-right font-medium w-16">Disp.</th>
                <th className="px-2 py-2 text-right font-medium w-28">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {colorGroups.map(group => {
                const allActive = [...group.sizeMap.values()].every(v => v.active)
                const totalAvail = activeSizes.reduce((sum, s) => {
                  const v = group.sizeMap.get(s)
                  if (!v || !v.active) return sum
                  const sd = stockDetails.get(v.sku)
                  return sum + (sd?.available ?? v.stock)
                }, 0)

                return (
                  <tr key={group.colorKey} className={`hover:bg-neutral-900/30 ${!allActive ? "opacity-50" : ""}`}>
                    {/* Cor */}
                    <td className="px-3 py-2">
                      {editingColor === group.colorKey ? (
                        <div className="flex items-center gap-1.5">
                          <input type="color" value={editColorHex} onChange={e => setEditColorHex(e.target.value)} className="h-6 w-6 rounded border border-neutral-700 bg-neutral-900 cursor-pointer" />
                          <input value={editColorName} onChange={e => setEditColorName(e.target.value)} className="h-6 w-20 rounded border border-neutral-700 bg-neutral-900 px-1.5 text-[10px] text-white outline-none" />
                          <button onClick={() => handleSaveColorEdit(group.colorKey)} className="text-emerald-400 hover:text-emerald-300 text-[10px] font-medium">OK</button>
                          <button onClick={() => setEditingColor(null)} className="text-neutral-500 hover:text-neutral-300"><X className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 shrink-0 rounded border border-neutral-700" style={{ backgroundColor: group.colorHex }} />
                          <span className="font-medium">{group.colorName}</span>
                          <button onClick={() => { setEditingColor(group.colorKey); setEditColorName(group.colorName); setEditColorHex(group.colorHex) }}
                            className="text-neutral-600 hover:text-neutral-300"><Edit2 className="h-2.5 w-2.5" /></button>
                        </div>
                      )}
                    </td>

                    {/* Estoque por tamanho */}
                    {activeSizes.map(size => {
                      const v = group.sizeMap.get(size)
                      const sd = v ? stockDetails.get(v.sku) : null
                      const available = sd?.available ?? v?.stock ?? 0
                      const hasRes = (sd?.reserved ?? 0) > 0

                      return (
                        <td key={size} className="px-1 py-1.5 text-center">
                          {v ? (
                            <div className="flex items-center justify-center gap-0.5">
                              <input
                                type="number" min={0} defaultValue={v.stock}
                                onBlur={e => { const n = parseInt(e.target.value) || 0; if (n !== v.stock) handleStockChange(v.sku, n) }}
                                className={`w-12 rounded px-1 py-0.5 text-center font-mono text-[10px] outline-none ${
                                  !v.active ? "bg-neutral-800/50 text-neutral-600 border border-neutral-800"
                                  : available === 0 ? "bg-red-950/40 text-red-400 border border-red-800/50"
                                  : hasRes ? "bg-amber-950/30 text-amber-300 border border-amber-800/40"
                                  : "bg-neutral-900 text-neutral-200 border border-neutral-800 focus:border-neutral-600"
                                }`}
                                disabled={saving === v.sku}
                              />
                              <button onClick={() => handleToggleVariant(v.sku)} title={v.active ? "Inativar" : "Ativar"}
                                className={`shrink-0 ${v.active ? "text-emerald-500" : "text-neutral-600"}`}>
                                {v.active ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                              </button>
                            </div>
                          ) : <span className="text-[10px] text-neutral-600">—</span>}
                        </td>
                      )
                    })}

                    {/* Total disponível */}
                    <td className={`px-2 py-2 text-right font-mono text-[10px] font-semibold ${totalAvail === 0 ? "text-red-400" : "text-emerald-400"}`}>
                      {totalAvail}
                    </td>

                    {/* Ações */}
                    <td className="px-2 py-1.5 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => handleToggleColor(group.colorKey)} title={allActive ? "Inativar cor" : "Ativar cor"}
                          className={`rounded p-1 ${allActive ? "text-emerald-500 hover:bg-emerald-950/40" : "text-neutral-600 hover:bg-neutral-800"}`}>
                          {allActive ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                        </button>
                        <button onClick={() => handleCopyColor(group.colorKey)} title="Copiar grade"
                          className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"><Copy className="h-3 w-3" /></button>
                        <button onClick={() => handleZeroColor(group.colorKey)} title="Zerar estoque"
                          className="rounded p-1 text-amber-500 hover:bg-amber-950/40"><AlertCircle className="h-3 w-3" /></button>
                        <button onClick={() => handleDeleteColor(group.colorKey)} title="Excluir cor"
                          className="rounded p-1 text-red-500 hover:bg-red-950/40"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-neutral-700 bg-neutral-900/20 py-8 text-center">
          <p className="text-sm text-neutral-400">Nenhuma cor cadastrada</p>
          <p className="mt-1 text-[10px] text-neutral-600">Adicione uma cor abaixo.</p>
        </div>
      )}

      {/* Legenda */}
      {colorGroups.length > 0 && (
        <div className="flex flex-wrap gap-3 text-[9px] text-neutral-500">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-neutral-900 border border-neutral-800" /> Normal</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-amber-950/30 border border-amber-800/40" /> Reservado</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-red-950/40 border border-red-800/50" /> Esgotado</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-neutral-800/50 border border-neutral-800" /> Inativo</span>
        </div>
      )}

      {/* ===== ADICIONAR COR ===== */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-3.5">
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Adicionar cor</p>
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block text-[9px] font-medium uppercase tracking-wider text-neutral-400">Nome</label>
            <input value={newColorName} onChange={e => setNewColorName(e.target.value)} placeholder="Ex: Preto, Azul Royal"
              className="h-9 w-full rounded border border-neutral-800 bg-neutral-900 px-3 text-xs text-white outline-none focus:border-neutral-600" />
          </div>
          <div>
            <label className="mb-1 block text-[9px] font-medium uppercase tracking-wider text-neutral-400">Cor</label>
            <input type="color" value={newColorHex} onChange={e => setNewColorHex(e.target.value)}
              className="h-9 w-14 rounded border border-neutral-800 bg-neutral-900 cursor-pointer" />
          </div>
          <button onClick={handleAddColor} disabled={saving === "adding-color" || !newColorName.trim()}
            className="flex h-9 items-center gap-1.5 rounded bg-emerald-600 px-4 text-[11px] font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
            {saving === "adding-color" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            Adicionar cor ({activeSizes.join("/")})
          </button>
        </div>
        {productSku && newColorName.trim() && (
          <p className="mt-2 text-[10px] text-neutral-500">
            SKUs: <span className="font-mono text-neutral-400">
              {activeSizes.map(s => `${productSku}-${makeColorKey(newColorName).toUpperCase()}-${s}`).join(", ")}
            </span>
          </p>
        )}
      </div>

      {/* ===== ADICIONAR TAMANHO CUSTOM ===== */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-3.5">
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Adicionar tamanho</p>
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="w-32">
            <label className="mb-1 block text-[9px] font-medium uppercase tracking-wider text-neutral-400">Nome</label>
            <input value={newSizeName} onChange={e => setNewSizeName(e.target.value)} placeholder="Ex: PP, XG, 3XG"
              className="h-9 w-full rounded border border-neutral-800 bg-neutral-900 px-3 text-xs text-white outline-none focus:border-neutral-600" />
          </div>
          <button onClick={handleAddSize} disabled={saving === "adding-size" || !newSizeName.trim()}
            className="flex h-9 items-center gap-1.5 rounded bg-neutral-700 px-4 text-[11px] font-medium text-white hover:bg-neutral-600 disabled:opacity-50">
            {saving === "adding-size" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            Adicionar tamanho (todas as cores)
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-neutral-600">Tamanhos atuais: {activeSizes.join(", ")}</p>
      </div>

      {/* Resumo */}
      {colorGroups.length > 0 && (
        <p className="text-[10px] text-neutral-500">
          {colorGroups.length} cor(es) · {activeSizes.length} tamanho(s) · {variants.length} variantes ·{" "}
          {variants.filter(v => v.active).reduce((s, v) => { const sd = stockDetails.get(v.sku); return s + (sd?.available ?? v.stock) }, 0)} disponíveis
        </p>
      )}
    </div>
  )
}
