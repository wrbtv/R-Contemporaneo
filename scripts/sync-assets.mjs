import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "dist");
const BUNDLE_NAME = "Restaurante_Contemporaneo_PREVIA_CATALOGO_CORRIGIDO_V2.zip";
const BUNDLE = path.join(ROOT, BUNDLE_NAME);
const TEMP = path.join(ROOT, ".netlify-source-bundle");

try {
  await fs.access(BUNDLE);
} catch {
  throw new Error(
    `Arquivo ${BUNDLE_NAME} não encontrado na raiz do repositório. Faça upload do ZIP original para o GitHub e o deploy automático será executado novamente.`
  );
}

await fs.rm(TEMP, { recursive: true, force: true });
await fs.mkdir(TEMP, { recursive: true });

let extracted = false;
try {
  execFileSync("unzip", ["-q", "-o", BUNDLE, "-d", TEMP], { stdio: "inherit" });
  extracted = true;
} catch {
  try {
    execFileSync("python3", ["-m", "zipfile", "-e", BUNDLE, TEMP], { stdio: "inherit" });
    extracted = true;
  } catch (error) {
    throw new Error("Não foi possível extrair o ZIP de imagens no ambiente de build: " + error.message);
  }
}
if (!extracted) throw new Error("A extração do pacote de imagens não foi concluída.");

const bundledAssets = path.join(TEMP, "assets");
const currentIndex = path.join(ROOT, "index.html");
for (const required of [bundledAssets, currentIndex]) {
  await fs.access(required);
}

await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });

// O ZIP restaura as fotografias originais em alta qualidade. Arquivos versionados no
// repositório são copiados por cima, permitindo substituir ativos diretamente pelo Git.
await fs.cp(bundledAssets, path.join(OUT, "assets"), { recursive: true, force: true });
try {
  await fs.cp(path.join(ROOT, "assets"), path.join(OUT, "assets"), { recursive: true, force: true });
} catch {}

const html = await fs.readFile(currentIndex, "utf8");
await fs.writeFile(path.join(OUT, "index.html"), html, "utf8");

for (const name of ["favicon.ico", "og-preview-v3.jpg", "site.webmanifest", "_headers"]) {
  let source = path.join(ROOT, name);
  try {
    await fs.access(source);
  } catch {
    source = path.join(TEMP, name);
  }
  try {
    await fs.copyFile(source, path.join(OUT, name));
  } catch {}
}

// Verifica as referências do catálogo antes de permitir a publicação.
const photoMapMatch = html.match(/const\s+photoMap\s*=\s*\{([\s\S]*?)\};);
if (!photoMapMatch) throw new Error("Não foi possível localizar o mapa de fotos do cardápio.");
const photoNames = [...photoMapMatch[1].matchAll(/:\s*'([^']+\.(?:png|jpe?g|webp|gif|svg))'/gi)].map(m => m[1]);
const missingActual = [];
for (const name of new Set(photoNames)) {
  try { await fs.access(path.join(OUT, "assets", "pratos", name)); }
  catch { missingActual.push(name); }
}
if (missingActual.length) {
  console.error("Fotos ausentes no pacote: " + missingActual.join(", "));
  throw new Error(`Build cancelado: ${missingActual.length} foto(s) do catálogo não foram encontradas.`);
}

console.log(`Build concluído: ${new Set(photoNames).size} referências de fotos do catálogo verificadas. Publicando para dist/.`);
await fs.rm(TEMP, { recursive: true, force: true });
