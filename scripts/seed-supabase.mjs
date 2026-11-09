import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

// Carrega .env manualmente
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
}

const supabaseUrl = env.VITE_SUPABASE_URL || 'https://sffnduiwduidscoyrirm.supabase.co';
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Importa produtos iniciais
const productsPath = path.join(process.cwd(), 'src/data/initialProducts.ts');
const fileContent = fs.readFileSync(productsPath, 'utf8');

const match = fileContent.match(/export const INITIAL_PRODUCTS: Product\[\] = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Não foi possível localizar INITIAL_PRODUCTS em src/data/initialProducts.ts');
  process.exit(1);
}

const arrayStr = match[1];
const products = eval(arrayStr);

async function runSeed() {
  console.log(`🚀 Iniciando sincronização de ${products.length} pratos com o Supabase...`);

  // 1. Extrair categorias únicas
  const categoryNames = [...new Set(products.map(p => p.cat))];
  console.log(`📂 Sincronizando ${categoryNames.length} categorias...`);

  const categoryMap = new Map();

  for (let i = 0; i < categoryNames.length; i++) {
    const name = categoryNames[i];
    const { data: existing } = await supabase
      .from('categories')
      .select('id, name')
      .eq('name', name)
      .maybeSingle();

    if (existing) {
      categoryMap.set(name, existing.id);
    } else {
      const { data: created, error } = await supabase
        .from('categories')
        .insert({ name, sort_order: i })
        .select('id, name')
        .single();
      if (!error && created) {
        categoryMap.set(name, created.id);
      }
    }
  }

  // 2. Buscar produtos já existentes no banco
  const { data: existingProducts } = await supabase.from('products').select('id, name');
  const existingMap = new Map((existingProducts || []).map(p => [p.name, p.id]));

  console.log('🍣 Inserindo itens do cardápio...');
  let successCount = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const category_id = categoryMap.get(p.cat) || null;
    const existingId = existingMap.get(p.name);

    const payload = {
      name: p.name,
      category_name: p.cat,
      category_id,
      price: p.price,
      description: p.desc,
      image_url: p.image_url,
      is_available: true,
      sort_order: i
    };

    if (existingId) {
      const { error } = await supabase.from('products').update(payload).eq('id', existingId);
      if (!error) successCount++;
    } else {
      const { error } = await supabase.from('products').insert([payload]);
      if (!error) successCount++;
    }
  }

  console.log(`✅ Seed concluído! ${successCount}/${products.length} pratos sincronizados com sucesso.`);
}

runSeed().catch(err => {
  console.error('Falha geral no seed:', err);
  process.exit(1);
});
