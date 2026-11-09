# Restaurante Contemporâneo v2.0 (React + Supabase + PWA)

Site oficial e cardápio interativo do **Restaurante Contemporâneo** em Ibiapina/CE, migrado para **React, TypeScript, Tailwind CSS e Supabase**.

---

## 🚀 Como Executar Localmente

1. Entre na pasta do projeto:
   ```bash
   cd R-Contemporaneo-main
   ```

2. Instale as dependências (caso necessário):
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   Acesse no seu navegador: `http://localhost:3000`

---

## 🗄️ Conectando com seu Banco de Dados Supabase

### 1. Obter as Chaves
No painel do seu projeto no [Supabase](https://supabase.com):
- Vá em **Project Settings → API**.
- Copie a **Project URL** e a **anon public key**.
- Abra o arquivo `.env` e cole:
  ```env
  VITE_SUPABASE_URL=https://seu-projeto.supabase.co
  VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
  ```

### 2. Criar as Tabelas e o Storage
No painel do Supabase, acesse **SQL Editor**, cole todo o conteúdo do arquivo:
`supabase/schema.sql` e clique em **Run**.

Isso criará:
- Tabelas: `categories`, `products`, `settings`
- Políticas de Segurança (Row Level Security - RLS)
- Bucket de fotos: `dishes` (com permissão pública de leitura e upload para admins)

### 3. Migração Automática dos Pratos Existentes (Seed)
Com o `.env` preenchido, execute no terminal:
```bash
npm run seed
```
Todos os pratos, categorias, preços e imagens já existentes no cardápio serão importados automaticamente para o Supabase!

### 4. Criar o Primeiro Administrador
No painel do Supabase:
1. Vá em **Authentication → Users → Add User → Create User**.
2. Cadastre o e-mail e a senha do gerente/dono do restaurante.
3. Acesse `http://localhost:3000/admin/login` e faça o login!

---

## 👑 Painel de Administração (`/admin`)

- **Controle de Disponibilidade em Tempo Real:** Pause ou ative pratos com apenas 1 clique quando um ingrediente acabar.
- **Gestão de Preços e Pratos:** Adicione novos itens, altere valores e edite descrições.
- **Upload Direto de Fotos:** Envie imagens dos pratos diretamente para o Supabase Storage.
- **Filtros e Métricas:** Visão rápida de quantos itens estão no cardápio e quantos estão ativos hoje.

---

## 📦 Backup da Versão Legada
A versão estática original anterior à migração está integralmente preservada na pasta `legacy-static/`.
