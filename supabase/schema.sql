-- ==========================================================
-- RESTAURANTE CONTEMPORÂNEO - ESQUEMA SUPABASE POSTGRESQL
-- ==========================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Produtos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Configurações do Restaurante (Horários, Chave Pix, Frete, Telefone WhatsApp)
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'general',
    restaurant_name TEXT DEFAULT 'Restaurante Contemporâneo',
    whatsapp_number TEXT DEFAULT '558894917022',
    delivery_fee_ibiapina NUMERIC(10, 2) DEFAULT 4.00,
    operating_hours TEXT DEFAULT '18:00 às 00:00',
    pix_key TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir configuração padrão inicial
INSERT INTO public.settings (id, restaurant_name, whatsapp_number, delivery_fee_ibiapina, operating_hours)
VALUES ('general', 'Restaurante Contemporâneo', '558894917022', 4.00, '18:00 às 00:00')
ON CONFLICT (id) DO NOTHING;

-- 5. Configurar Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Políticas de Categorias:
-- Qualquer visitante pode ler as categorias
CREATE POLICY "Categorias visíveis publicamente"
ON public.categories FOR SELECT
TO public
USING (true);

-- Apenas administradores autenticados podem inserir, atualizar e deletar
CREATE POLICY "Admins podem gerenciar categorias"
ON public.categories FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Políticas de Produtos:
-- Qualquer visitante pode ler produtos disponíveis (ou todos no cardápio)
CREATE POLICY "Produtos visíveis publicamente"
ON public.products FOR SELECT
TO public
USING (true);

-- Apenas administradores autenticados podem inserir, atualizar e deletar
CREATE POLICY "Admins podem gerenciar produtos"
ON public.products FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Políticas de Configurações:
CREATE POLICY "Configurações visíveis publicamente"
ON public.settings FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins podem atualizar configurações"
ON public.settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Storage Bucket para fotos dos pratos
-- Cria o bucket 'dishes' se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('dishes', 'dishes', true)
ON CONFLICT (id) DO NOTHING;

-- Política para leitura pública das imagens do bucket 'dishes'
CREATE POLICY "Fotos dos pratos são públicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'dishes');

-- Política para upload e edição de imagens apenas por usuários autenticados
CREATE POLICY "Admins podem fazer upload de fotos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'dishes');

CREATE POLICY "Admins podem atualizar fotos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'dishes');

CREATE POLICY "Admins podem deletar fotos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'dishes');
