# Fashion Store — Drive UI Fix

## O que foi corrigido

1. **UI do Google Drive voltou para o MediaManager**
   - Bloco recolhível “Importar do Google Drive” dentro da aba de mídia.
   - Campo para URL/ID da pasta do Drive.
   - Seletor de destino: Geral do produto ou cor específica.
   - Campo de limite de arquivos.
   - Status visual quando `GOOGLE_DRIVE_API_KEY` não está configurada.

2. **Importação integrada à mídia por cor**
   - Ao importar para uma cor, o payload envia `colorKey`, `colorName` e `colorHex`.
   - As imagens importadas aparecem no grupo correto do MediaManager.

3. **Mensagem de erro de upload melhorada**
   - Quando o upload sobe para o Storage, mas falha ao registrar no banco, a UI agora tenta exibir a mensagem real da API.

4. **Drive import evita duplicar cover/hover em grupo que já tem mídia**
   - O serviço agora verifica quantas imagens já existem no grupo geral/cor antes de definir role `cover`, `hover` ou `gallery`.

## Observação obrigatória

Antes de testar mídia por cor, rode no Supabase:

```sql
supabase/migrations/006_media_by_color.sql
```

Essa migration adiciona `color_key`, `color_name`, `color_hex` e `variant_sku` em `product_media`.
