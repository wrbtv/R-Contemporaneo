# Restaurante Contemporâneo

Site oficial do Restaurante Contemporâneo, em Ibiapina/CE.

## Publicação contínua (Netlify)

Este repositório é a origem do código. Para que cada alteração enviada à branch `main` atualize o site publicado:

1. No Netlify, abra o projeto **rcontemporaneo**.
2. Acesse **Project configuration / Build & deploy / Continuous deployment** (a nomenclatura pode variar).
3. Conecte o repositório GitHub `wrbtv/R-Contemporaneo` à branch `main`.
4. Confirme que os deploys automáticos estão habilitados.

Depois dessa conexão, um commit/push na `main` iniciará um novo deploy automaticamente.

## Ativos/imagens

Para preservar todos os ativos da versão que já está no ar sem os republicar manualmente neste primeiro passo, o comando de build recupera os caminhos de imagem/ícone referenciados no `index.html` da publicação pública anterior em `https://rcontemporaneo.netlify.app`. O build falha, em vez de publicar uma versão sem imagens, se algum ativo não puder ser recuperado.

**Importante:** não remova nem desative a publicação atualmente ativa antes do primeiro deploy conectado ao Git, pois ela é usada como fonte dos ativos iniciais. Depois da conexão, mantenha esse domínio público disponível para o sincronizador de ativos.

## Funcionalidades mantidas

- Cardápio por categorias e imagens ilustrativas.
- Carrinho com ajuste de quantidades e total automático.
- Taxa de entrega de R$ 4,00 para Ibiapina/CE e frete a consultar para outras localidades.
- Formulário de checkout e envio do pedido preparado para WhatsApp.
- Horário de atendimento das 18:00 às 00:00.
- Favicon e metadados Open Graph/Twitter para compartilhamento.

## Configuração

O endereço-fonte dos ativos pode ser substituído pela variável de ambiente `SITE_ASSET_SOURCE` se necessário.
