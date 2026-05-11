# Fashion Store — v19 (Ajuste comercial de apresentação)

## Objetivo
Deixar o projeto bonito, demonstrável e convincente para apresentar para lojas locais.
Nenhuma mudança em carrinho, checkout, pedidos, Supabase ou regras operacionais.

## Validação
```
npm run typecheck  ✓ sem erros
npm run lint       ✓ 0 errors, 19 warnings
npm run build      ✓ todas as rotas geradas
```

---

## O que mudou visualmente

### 1. Hero mais comercial
**Arquivo:** `components/home/hero-section.tsx` — REESCRITO

- Trust badge no topo: "Vitrine digital · Venda pelo WhatsApp" com ícone dourado
- Título com gradiente: "Sua loja cristã **online e profissional.**"
- Subtítulo focado no fluxo: "Escolha no catálogo, monte sua sacola e finalize direto pelo WhatsApp"
- CTAs empilham em mobile (full-width), lado a lado em desktop
- Social proof bar: "Entrega combinada · Pagamento flexível · Atendimento pessoal"
- Overlay mais forte no bottom pra garantir legibilidade em qualquer foto

### 2. ProductCard premium
**Arquivo:** `components/product-card.tsx` — REESCRITO

- Badges empilhados (desconto + badge + "Últimas N!") em vez de um badge só
- Badge "Últimas N!" em amarelo quando estoque ≤ 5
- Esgotado com pill centralizado em vez de overlay bruto
- Hover CTA "Ver peça" com ícone Eye
- Preço com layout flex-wrap pra nunca cortar em mobile
- Nome com `line-clamp-2` + `break-words` (não corta em 320px)
- Transição de hover mais suave (700ms)
- Imagem com rounded-xl no featured, rounded-lg no grid

### 3. Como comprar (HowToBuySection)
**Arquivo:** `components/home/how-to-buy-section.tsx` — REESCRITO

- Layout vertical no mobile (com linha conectora entre steps)
- Layout horizontal no desktop (4 colunas com connector line)
- Descrições mais ricas: "Explore o catálogo online e encontre peças que expressam sua fé"
- CTA WhatsApp grande no fim da seção
- Texto de apoio: "Sem cadastro, sem complicação. Tudo pelo WhatsApp."

### 4. Benefícios (BenefitsSection)
**Arquivo:** `components/home/benefits-section.tsx` — REESCRITO

- Copy mais humano: "Nada de robô. Você fala direto com a gente pelo WhatsApp."
- Cards com hover effect (border + shadow)
- Background com gradiente sutil
- Ícones com fundo translúcido que muda no hover

### 5. CTA final
**Arquivo:** `components/home/cta-section.tsx` — texto atualizado

- Título: "Pronto pra vestir propósito?"
- Texto: "Monte sua sacola no catálogo e finalize pelo WhatsApp. Atendimento pessoal, pagamento flexível e entrega combinada."

### 6. Admin hub demonstrável
**Arquivo:** `app/admin/page.tsx` — REESCRITO

- 4 stat cards: Produtos ativos, Rascunhos, Pedidos pendentes, Em andamento
- Alertas visuais coloridos com links diretos:
  - Azul: "N pedido(s) aguardando confirmação" → /admin/pedidos
  - Vermelho: "N produto(s) sem imagem de capa" → /admin/midias
  - Vermelho: "N produto(s) com estoque zerado" → /admin/produtos
  - Amarelo: "N produto(s) com estoque baixo (≤ 5 un.)" → /admin/produtos
- Quick actions: Novo produto, Ver pedidos, Abrir vitrine
- Módulos com gradient cards

### 7. MediaManager callback (v18.3 fix)
**Arquivo:** `components/admin/media-manager.tsx` — adicionado `onMediaChange` prop

- Quando admin muda mídia (upload, delete, reorder, role change), dispara callback
- ProductForm recebe e atualiza `structuredMedia` → checklist visual recomputa em tempo real

---

## Mobile (320–414px)

- Hero: CTAs empilham full-width, social proof com 2 itens visíveis + 1 hidden em <sm
- ProductCard: `line-clamp-2` + `break-words` no nome, preço com flex-wrap
- HowToBuy: steps verticais com connector line, sem 4-col grid apertado
- Benefits: 2-col grid com padding reduzido, texto não corta
- Admin: stats em 2-col grid, alertas com texto que quebra naturalmente

---

## Arquivos tocados

| Arquivo | Mudança |
|---|---|
| `components/home/hero-section.tsx` | Reescrito |
| `components/product-card.tsx` | Reescrito |
| `components/home/how-to-buy-section.tsx` | Reescrito |
| `components/home/benefits-section.tsx` | Reescrito |
| `components/home/cta-section.tsx` | Texto atualizado |
| `app/admin/page.tsx` | Reescrito com alertas |
| `components/admin/media-manager.tsx` | `onMediaChange` prop |

## O que NÃO foi tocado (intencional)

- Carrinho, checkout, pedidos, Supabase — nada mexido
- `/produtos` — já estava funcional (filtros, chips, paginação, empty state)
- Product details — galeria e informações já funcionam; refinamento visual ficaria grande demais pra esta rodada sem risco de quebrar
- `/admin/produtos` tabela — já tinha busca, filtro, status badges, estoque colorido
- Nenhum banco criado, nenhuma feature nova, nenhuma arquitetura inventada
