import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const INDEX = path.join(ROOT, "index.html");
const SOURCE_ORIGIN = (process.env.SITE_ASSET_SOURCE || "https://rcontemporaneo.netlify.app").replace(/\/$/, "");

const html = await fs.readFile(INDEX, "utf8");
const refs = new Set([
  "favicon.ico",
  "site.webmanifest",
  "og-preview-v3.jpg"
]);

// Recupera todos os arquivos locais referenciados no HTML, CSS e JavaScript
// do site publicado anteriormente, preservando as imagens existentes.
const assetPattern = /(?:\.?\/?|\/)?(assets\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|webp|gif|svg|ico|json|woff2?))/gi;
for (const match of html.matchAll(assetPattern)) {
  refs.add(match[1].replace(/^\.\//, ""));
}

// Também reconhece caminhos relativos de arquivos de compartilhamento/ícones na raiz.
for (const name of ["favicon.ico", "site.webmanifest", "og-preview-v3.jpg"]) refs.add(name);

if (!refs.size) throw new Error("Nenhuma referência de imagem/ativo foi encontrada.");

const failed = [];
let count = 0;
for (const relative of refs) {
  const safe = path.normalize(relative).replace(/^\.\.(?:[\\/]|$)/, "");
  const target = path.join(ROOT, safe);
  try {
    const response = await fetch(`${SOURCE_ORIGIN}/${safe.split(path.sep).map(encodeURIComponent).join("/")}`, {
      redirect: "follow",
      headers: { "user-agent": "R-Contemporaneo-Netlify-Asset-Sync/1.0" }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, Buffer.from(await response.arrayBuffer()));
    count++;
  } catch (error) {
    failed.push(`${safe}: ${error.message}`);
  }
}

console.log(`Arquivos recuperados de ${SOURCE_ORIGIN}: ${count}/${refs.size}`);
if (failed.length) {
  console.error("Não foi possível recuperar todos os arquivos referenciados:");
  for (const item of failed) console.error(" - " + item);
  throw new Error("Build interrompido para evitar publicar o site sem imagens/ativos.");
}
