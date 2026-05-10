# Fashion Store — Admin 2.0 Lote 2 (grade + abas)

## O que este lote entrega

O editor de produto foi reescrito com abas e grade inteligente de variantes.

## Validação
```
npm run typecheck  ✓ sem erros
npm run lint       ✓ 0 errors, 19 warnings
npm run build      ✓
```

---

## 1. Editor de produto em abas

`app/admin/produtos/product-form.tsx` — reescrito completo.

6 abas:

### Aba "Básico"
- Nome (auto-gera slug na criação)
- Slug
- SKU base (usado na geração de SKUs das variantes)
- Categoria
- Status
- Tags
- Descrição
- Detalhes (um por linha)

### Aba "Comercial"
- Preço atual
- Preço original (pra desconto)
- Badge
- Flags: Novidade / Promoção / Mais vendida

### Aba "Variações"
Grade inteligente cor × tamanho (componente separado, detalhes abaixo).

### Aba "Mídia"
MediaManager existente (por enquanto sem grupos por cor — Lote 3).

### Aba "Conteúdo"
- Composição / Material
- Modelagem / Fit
- Cuidados (um por linha)
- Guia de medidas (formato CSV: TAM, LARGURA, COMPRIMENTO)
  com **preview visual** da tabela em tempo real

### Aba "Publicação"
- Checklist completo com checks verdes/vermelhos
- Botões de ação: Publicar (ativar), Salvar rascunho, Ocultar, Ver no site
- Validação server impede ativar produto incompleto

---

## 2. Grade inteligente cor × tamanho

`app/admin/produtos/tabs/tab-variants.tsx` — componente novo.

### Fluxo do operador:
1. Digita nome da cor ("Preto") e escolhe hex
2. Clica "Adicionar cor" → sistema cria P, M, G, GG com estoque 0
3. Edita estoque por célula (input numérico direto na grade)
4. SKUs são gerados automaticamente: `CAM-CRISTO-PRETO-P`, etc.

### Funcionalidades:
- **Adicionar cor** — cria 4 variantes (P/M/G/GG) de uma vez
- **Editar estoque por célula** — onBlur salva via API
- **Zerar estoque** de uma cor inteira (um clique)
- **Copiar grade** pra nova cor (duplica estrutura)
- **Excluir cor** (remove todas as variantes daquela cor)
- **Preview de SKUs** ao digitar nome da cor

### Visualização de estoque:
- Fundo normal (verde/neutro): estoque disponível
- Fundo âmbar: tem reservas ativas
- Fundo vermelho: esgotado (disponível = 0)
- Legenda visual embaixo da grade
- Coluna "Total" com soma de disponível por cor
- Resumo: "3 cor(es) · 12 variantes · 45 unidades disponíveis"

### Proteções:
- Impede cor duplicada (compara por slug normalizado)
- Impede adicionar sem SKU base definido
- Confirmação antes de excluir cor
- Confirmação antes de zerar estoque

---

## 3. Header sticky com abas

O header do editor agora é sticky com:
- Botão voltar
- Nome do produto (atualiza em tempo real)
- ID do produto
- Botão salvar
- Barra de abas com scroll horizontal em mobile

---

## Arquivos novos
- `app/admin/produtos/tabs/tab-variants.tsx`

## Arquivos alterados
- `app/admin/produtos/product-form.tsx` — reescrito (abas + integração)

## Próximo lote (3)

- MediaManager por cor (grupos: Geral, Preto, Azul)
- ProductGallery pública por cor
- ProductCard com cover por cor
- Checklist atualizado pra roupa
- Categorias vs coleções
