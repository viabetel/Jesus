# Fashion Store — Admin 2.0 Lote 3 (mídia por cor + público + checklist)

## Validação
```
npm run typecheck  ✓ sem erros
npm run lint       ✓ 0 errors, 20 warnings
npm run build      ✓
```

---

## 1. MediaManager v2 — organizado por cor

`components/admin/media-manager.tsx` — reescrito completo.

### Grupos por cor
A mídia agora é organizada em grupos visuais:
- **Geral do produto** — mídia sem cor (fallback pra qualquer cor que não tenha mídia própria)
- **Preto** — mídia da cor Preto
- **Azul** — mídia da cor Azul
- *etc. — um grupo por cor cadastrada nas variantes*

Cada grupo mostra:
- Grid de imagens com drag-drop, role badge, dropdown de role
- Alertas: "Sem capa" se a cor não tem cover, "Sem mídia" se vazio
- Vídeos separados abaixo das imagens
- Contagem de mídias

### Upload com seleção de cor
Antes de subir um arquivo, o admin escolhe:
- "Geral do produto" ou
- Uma das cores cadastradas (Preto, Azul, etc.)

A primeira imagem de um grupo automaticamente vira cover, a segunda hover.

### Integração automática com variantes
As cores disponíveis vêm das variantes do produto (passadas via prop `availableColors`).
Quando o admin adiciona uma cor na grade de variantes, ela aparece automaticamente no MediaManager.

### Drag & Drop entre itens do mesmo grupo
Reordenar só funciona dentro do mesmo grupo de cor. Não permite arrastar uma mídia de "Preto" pra "Azul" (isso mudaria a cor da mídia, que não é a intenção de um drag).

---

## 2. ProductGallery pública por cor

`app/produto/[slug]/page.tsx` agora carrega `getProductMedia(product.id)` e serializa toda a mídia
pra passar ao `ProductDetails` como `structuredMedia`.

`components/products/product-details.tsx` agora:
- Aceita `structuredMedia?: MediaItem[]`
- Quando `selectedColor` muda, filtra a mídia por cor:
  1. Mídia da cor selecionada (colorKey = 'preto') → usa
  2. Mídia geral (colorKey = null) → fallback
  3. images[] legado → último fallback
- Passa `galleryImages` derivado pra `ProductGallery`

Resultado: selecionar Preto mostra fotos pretas. Selecionar Azul mostra fotos azuis.
Se Azul não tiver fotos próprias, mostra as fotos gerais. Nunca mostra fotos de outra cor.

---

## 3. ProductCard com cover da cor padrão

`lib/services/public-catalog.ts` — `enrichProduct` atualizado:
- Determina a "cor padrão" (primeira cor ativa do produto)
- Busca cover/hover na ordem: cor padrão → geral → qualquer
- O ProductCard mostra cover/hover da cor certa automaticamente

---

## 4. Resumo do modelo completo (3 lotes)

```
Produto base
  → Variantes (cor × tamanho com grade inteligente)
    → SKUs automáticos (PRODUTO-COR-TAMANHO)
    → Estoque por célula (com reservado/consumido/disponível)
  → Mídia por cor
    → Geral (fallback)
    → Por cor (cover, hover, galeria, vídeo)
  → Checklist de publicação (server-side + visual)
  → Conteúdo da peça (composição, modelagem, cuidados, guia de medidas)
```

## Arquivos novos
- Nenhum (todos foram atualizados de existentes)

## Arquivos alterados
- `components/admin/media-manager.tsx` — reescrito (grupos por cor, upload com seleção de cor)
- `app/admin/produtos/product-form.tsx` — passa availableColors ao MediaManager
- `app/produto/[slug]/page.tsx` — carrega product_media e serializa
- `components/products/product-details.tsx` — aceita structuredMedia, filtra por cor, passa pra galeria
- `lib/services/public-catalog.ts` — enrichProduct prefere cover da cor padrão

## Setup
```sql
-- Rode no Supabase SQL Editor (se ainda não rodou no Lote 1):
-- supabase/migrations/006_media_by_color.sql
```

## Próximas tarefas pendentes (do escopo original de 16)

Já feitas: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 (parcial), 16
Pendentes: 10 (checklist completo de roupa), 11 (rascunhos), 12 (categorias vs coleções),
13 (listagem admin), 14 (duplicar), 15 (guia de medidas estruturado)
