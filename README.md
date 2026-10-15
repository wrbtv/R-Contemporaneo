# Restaurante Contemporâneo

Site oficial do Restaurante Contemporâneo, em Ibiapina/CE.

## Publicação automática pelo GitHub + Netlify

- Repositório: `wrbtv/R-Contemporaneo`
- Branch de produção: `main`
- Build command: `node scripts/sync-assets.mjs`
- Publish directory: `dist`

O arquivo `Restaurante_Contemporaneo_PREVIA_CATALOGO_CORRIGIDO_V2.zip` precisa ficar na raiz do repositório como pacote-base das fotografias originais. O build restaura os ativos a partir desse pacote e usa o `index.html` versionado no Git para montar a página publicada. Arquivos colocados na pasta `assets/` do repositório têm prioridade sobre os do pacote.

Depois que o ZIP estiver no GitHub, cada commit enviado para `main` dispara uma nova publicação automaticamente.

## Funcionalidades mantidas

- Cardápio por categorias e fotografias dos pratos.
- Carrinho com ajuste de quantidades e total automático.
- Taxa de entrega de R$ 4,00 para Ibiapina/CE e frete a consultar para outras localidades.
- Formulário de checkout e envio do pedido preparado para WhatsApp.
- Horário de atendimento das 18:00 às 00:00.
- Metadados de compartilhamento e favicon.
