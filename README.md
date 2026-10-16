# Restaurante Contemporâneo

Site oficial do Restaurante Contemporâneo, em Ibiapina/CE.

**Domínio pretendido:** https://rcontemporaneo.com.br  
**Domínio alternativo:** https://www.rcontemporaneo.com.br

## Publicação pelo Cloudflare Workers (alternativa ao Netlify)

A configuração de deploy pelo Cloudflare está preparada no arquivo `wrangler.jsonc`. O Worker chama-se `r-contemporaneo`, publica os arquivos estáticos da pasta `dist` e executa `npm run build` automaticamente antes do deploy. A configuração do pacote inclui Wrangler para manter o CLI de publicação definido no projeto.

Para ativar a publicação automática uma única vez no painel Cloudflare:
1. Abra **Workers & Pages** e selecione o Worker existente chamado `r-contemporaneo` (ou crie-o com exatamente esse nome).
2. Entre em **Settings → Builds → Connect** e conecte o repositório `wrbtv/R-Contemporaneo`.
3. Selecione a branch `main`. Use a raiz do repositório como diretório e o comando padrão de deploy `npx wrangler deploy`. A compilação é executada pela configuração do Wrangler.
4. Salve e rode um deploy. Confira a URL `workers.dev` antes de direcionar o domínio principal.

**Importante:** o domínio principal e o projeto Netlify permanecem inalterados enquanto a versão no Cloudflare não for validada. A migração do domínio deve ser feita somente depois que a cópia no Cloudflare estiver funcionando, e a configuração de DNS deve ser conferida no painel onde a zona do domínio é gerenciada.

## Publicação automática pelo GitHub + Netlify

- Repositório: `wrbtv/R-Contemporaneo`
- Branch de produção: `main`
- Build command: `node scripts/sync-assets.mjs`
- Publish directory: `dist`
- Site Netlify: `rescontemporaneo.netlify.app`

O arquivo `Restaurante_Contemporaneo_PREVIA_CATALOGO_CORRIGIDO_V2.zip` fica na raiz do repositório como pacote-base das fotografias originais. O build restaura os ativos a partir desse pacote, usa o `index.html` versionado no Git e valida as imagens antes de publicar.

## Ligar o domínio na Localweb

1. No Netlify, abra **Domain management** do projeto `rescontemporaneo`, adicione `rcontemporaneo.com.br` como domínio já registrado e confirme os detalhes de DNS apresentados pelo Netlify.
2. Na zona DNS da Localweb, aponte o domínio raiz com o registro A informado pelo Netlify. Para a configuração padrão do Netlify, normalmente é `@` → `75.2.60.5`. Se a zona aceitar ALIAS/ANAME, siga a instrução que o Netlify mostrar.
3. Crie o registro CNAME para `www` apontando para `rescontemporaneo.netlify.app`, conforme a configuração de domínio mostrada pelo Netlify.
4. Não apague registros MX/TXT nem altere nameservers sem verificar se há e-mail ou outros serviços em uso.
5. Depois da propagação DNS, valide o domínio no Netlify e aguarde o certificado HTTPS ser emitido.

## Funcionalidades

- Cardápio por categorias e fotografias dos pratos.
- Carrinho com ajuste de quantidades e total automático.
- Taxa de entrega de R$ 4,00 para Ibiapina/CE e frete a consultar para outras localidades.
- Checkout e envio do pedido ao WhatsApp.
- Horário de atendimento das 18:00 às 00:00.
- Canonical, Open Graph e Twitter cards usando o domínio próprio.

## Correções visuais premium opcionais

O arquivo `catalogo-correcoes-premium.zip`, quando enviado à raiz da branch `main`, é aplicado automaticamente pelo build do Netlify. Ele contém as fotos revisadas de Sheik Pimenta, Empanado de frango e Empanado de carne. O build muda os mapeamentos desses três itens para as novas imagens e valida os arquivos antes de publicar. Sem esse pacote, o catálogo existente continua sendo publicado normalmente.
