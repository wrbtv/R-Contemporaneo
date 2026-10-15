import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "dist");
const TEMP = path.join(ROOT, ".netlify-source-bundle");
const CORRECTION_BUNDLE_NAME = "catalogo-correcoes-premium.zip";
const CORRECTIONS_TEMP = path.join(ROOT, ".netlify-corrections");
const BUNDLE_PATTERN = /^Restaurante_Contemporaneo_PREVIA_CATALOGO_CORRIGIDO_V2(?:\s*\(\d+\))?\.zip$/i;

const rootFiles = await fs.readdir(ROOT);
const bundles = rootFiles.filter(name => BUNDLE_PATTERN.test(name));
if (!bundles.length) {
  throw new Error("Não encontrei o ZIP de catálogo V2 na raiz do repositório. Envie Restaurante_Contemporaneo_PREVIA_CATALOGO_CORRIGIDO_V2.zip ao GitHub.");
}
bundles.sort((a, b) => Number(/\(\d+\)/.test(a)) - Number(/\(\d+\)/.test(b)));
const bundle = path.join(ROOT, bundles[0]);

await fs.rm(TEMP, { recursive: true, force: true });
await fs.rm(CORRECTIONS_TEMP, { recursive: true, force: true });
await fs.mkdir(TEMP, { recursive: true });

try {
  execFileSync("unzip", ["-q", "-o", bundle, "-d", TEMP], { stdio: "inherit" });
} catch (firstError) {
  try {
    execFileSync("python3", ["-m", "zipfile", "-e", bundle, TEMP], { stdio: "inherit" });
  } catch (secondError) {
    throw new Error("Não consegui extrair o pacote de imagens. unzip: " + firstError.message + "; python: " + secondError.message);
  }
}

// Pacote opcional de correções visuais. Enquanto ele não existe, a publicação atual
// continua funcionando normalmente. Quando for enviado ao GitHub, suas fotos e seus
// mapeamentos serão aplicados no build automático.
await fs.rm(CORRECTIONS_TEMP, { recursive: true, force: true });
const correctionBundle = path.join(ROOT, CORRECTION_BUNDLE_NAME);
let hasCorrections = false;
try {
  await fs.access(correctionBundle);
  await fs.mkdir(CORRECTIONS_TEMP, { recursive: true });
  try {
    execFileSync("unzip", ["-q", "-o", correctionBundle, "-d", CORRECTIONS_TEMP], { stdio: "inherit" });
  } catch (firstError) {
    try {
      execFileSync("python3", ["-m", "zipfile", "-e", correctionBundle, CORRECTIONS_TEMP], { stdio: "inherit" });
    } catch (secondError) {
      throw new Error("Não foi possível extrair " + CORRECTION_BUNDLE_NAME + ": " + firstError.message + "; " + secondError.message);
    }
  }
  await fs.access(path.join(CORRECTIONS_TEMP, "assets", "pratos", "sheik-pimenta-premium.webp"));
  await fs.access(path.join(CORRECTIONS_TEMP, "assets", "pratos", "executivo-empanado-frango.webp"));
  await fs.access(path.join(CORRECTIONS_TEMP, "assets", "pratos", "executivo-empanado-carne.webp"));
  hasCorrections = true;
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const bundledAssets = path.join(TEMP, "assets");
const indexPath = path.join(ROOT, "index.html");
await fs.access(bundledAssets);
let html = await fs.readFile(indexPath, "utf8");

if (hasCorrections) {
  const replacements = [
    ["'Sheik Pimenta':'sheik-pimenta-premium.jpg'", "'Sheik Pimenta':'sheik-pimenta-premium.webp'"],
    ["'Empanado de frango':'executivo-empanado-frango.jpg'", "'Empanado de frango':'executivo-empanado-frango.webp'"],
    ["'Empanado de carne':'executivo-empanado-carne.jpg'", "'Empanado de carne':'executivo-empanado-carne.webp'"]
  ];
  for (const [before, after] of replacements) {
    if (!html.includes(before) && !html.includes(after)) {
      throw new Error("Pacote de correções encontrado, mas não localizei no index.html: " + before);
    }
    html = html.replace(before, after);
  }
}

await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });

// Primeiro restaura todas as fotos do ZIP original. Os ativos no Git têm prioridade
// quando houver substituições intencionais versionadas.
await fs.cp(bundledAssets, path.join(OUT, "assets"), { recursive: true, force: true });
try {
  await fs.cp(path.join(ROOT, "assets"), path.join(OUT, "assets"), { recursive: true, force: true });
} catch { /* o ZIP pode ser a única fonte de ativos */ }
if (hasCorrections) {
  await fs.cp(path.join(CORRECTIONS_TEMP, "assets"), path.join(OUT, "assets"), { recursive: true, force: true });
}

await fs.writeFile(path.join(OUT, "index.html"), html, "utf8");

// Os arquivos auxiliares ficam no repositório ou na raiz do ZIP.
for (const name of ["favicon.ico", "og-preview-v3.jpg", "site.webmanifest", "service-worker.js", "_headers"]) {
  let source = path.join(ROOT, name);
  try {
    await fs.access(source);
  } catch {
    source = path.join(TEMP, name);
  }
  try {
    await fs.copyFile(source, path.join(OUT, name));
  } catch { /* alguns sites não possuem todos os opcionais */ }
}

// Valida todas as fotos declaradas no catálogo antes de publicar.
const photoMapMatch = html.match(/const\s+photoMap\s*=\s*\{([\s\S]*?)\};/);
if (!photoMapMatch) throw new Error("Não encontrei o mapa de imagens do catálogo no index.html.");
const photoNames = [...photoMapMatch[1].matchAll(/:\s*'([^']+\.(?:png|jpe?g|webp|gif|svg))'/gi)].map(match => match[1]);
const missing = [];
for (const name of new Set(photoNames)) {
  try {
    await fs.access(path.join(OUT, "assets", "pratos", name));
  } catch {
    missing.push(name);
  }
}
if (missing.length) {
  console.error("Imagens do catálogo ausentes:", missing.join(", "));
  throw new Error("Deploy cancelado para evitar publicar o catálogo com fotos quebradas.");
}

// Valida os ativos locais diretamente referenciados no HTML/CSS.
const localAssetRefs = new Set();
for (const match of html.matchAll(/(?:src|href)\s*=\s*["']\/?(assets\/[^"'?#]+)|url\(["']?\/?(assets\/[^"'?#)]+)["']?\)/gi)) {
  const ref = match[1] || match[2];
  if (ref) localAssetRefs.add(ref);
}
const missingLocal = [];
for (const ref of localAssetRefs) {
  try {
    await fs.access(path.join(OUT, ref));
  } catch {
    missingLocal.push(ref);
  }
}
if (missingLocal.length) {
  console.error("Ativos locais ausentes:", missingLocal.join(", "));
  throw new Error("Deploy cancelado: faltam ativos locais referenciados no site.");
}

console.log("Pacote usado: " + path.basename(bundle));
console.log("Fotos do catálogo verificadas: " + new Set(photoNames).size);
console.log("Ativos locais verificados: " + localAssetRefs.size);
console.log("Build concluído. Publicando para dist/.");
await fs.rm(TEMP, { recursive: true, force: true });
