import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

// Lê variáveis do .env ou do ambiente
const envPath = path.join(process.cwd(), '.env');
const env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
}

const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Configure VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const pratosDir = path.join(process.cwd(), 'public', 'assets', 'pratos');

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.webp': return 'image/webp';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

async function uploadAll() {
  if (!fs.existsSync(pratosDir)) {
    console.error('Diretório de pratos não encontrado:', pratosDir);
    process.exit(1);
  }

  const files = fs.readdirSync(pratosDir).filter(f => /\.(webp|jpe?g|png)$/i.test(f));
  console.log(`📤 Iniciando upload de ${files.length} fotos para o Supabase Storage (bucket 'dishes')...`);

  let uploaded = 0;
  const urlMap = new Map();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(pratosDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = getMimeType(file);

    const { error: uploadError } = await supabase.storage
      .from('dishes')
      .upload(file, fileBuffer, {
        contentType: mimeType,
        upsert: true,
        cacheControl: '31536000' // 1 ano de cache na CDN
      });

    if (uploadError) {
      console.warn(`Erro no upload de ${file}:`, uploadError.message);
    } else {
      uploaded++;
      const { data: { publicUrl } } = supabase.storage
        .from('dishes')
        .getPublicUrl(file);
      urlMap.set(file, publicUrl);
    }
  }

  console.log(`✅ Upload finalizado: ${uploaded}/${files.length} imagens no Supabase Storage!`);

  // Agora vamos atualizar os produtos no banco com a URL pública do Supabase
  console.log('🔄 Atualizando a coluna image_url dos produtos no banco Supabase...');
  const { data: products } = await supabase.from('products').select('id, name, image_url');

  let updatedProducts = 0;
  for (const p of products || []) {
    if (!p.image_url) continue;
    const filename = path.basename(p.image_url);
    const cloudUrl = urlMap.get(filename);

    if (cloudUrl) {
      const { error } = await supabase
        .from('products')
        .update({ image_url: cloudUrl })
        .eq('id', p.id);
      if (!error) updatedProducts++;
    }
  }

  console.log(`🎉 Sucesso! ${updatedProducts} pratos atualizados com suas URLs na nuvem Supabase CDN.`);
}

uploadAll().catch(err => {
  console.error('Falha geral:', err);
  process.exit(1);
});
