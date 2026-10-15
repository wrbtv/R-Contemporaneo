import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "dist");
const INDEX = path.join(ROOT, "index.html");
const SOURCE_ORIGIN = (process.env.SITE_ASSET_SOURCE || "https://rcontemporaneo.netlify.app").replace(/\/$/, "");

const html = await fs.readFile(INDEX, "utf8");
const refs = new Set(["favicon.ico", "site.webmanifest", "og-preview-v3.jpg"]);

// Recupera arquivos da publicação anterior enquanto o primeiro deploy conectado ao Git
// é montado. O build atual só é publicado se todos os ativos forem recuperados.
const assetPattern = /(?:\.?\/?|\/)?(assets\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|webp|gif|svg|ico|json|woff2?))/gi;
for (const match of html.matchAll(assetPattern)) refs.add(match[1].replace(/^\.\//, ""));

// As fotos individuais estão listadas em photoMap como nomes de arquivo, sem o prefixo assets/.
const photoMapMatch = html.match(/const\s+photoMap\s*=\s*\{([\s\S]*?)\};/);
if (photoMapMatch) {
  for (const match of photoMapMatch[1].matchAll(/:\s*'([^']+\.(?:png|jpe?g|webp|gif|svg))'/gi)) {
    refs.add("assets/pratos/" + match[1]);
  }
}

await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });
await fs.copyFile(INDEX, path.join(OUT, "index.html"));

const failed = [];
let count = 0;
for (const relative of refs) {
  const safe = path.normalize(relative).replace(/^\.\.(?:[\\/]|$)/, "");
  const source = path.join(ROOT, safe);
  const target = path.join(OUT, safe);
  try {
    // Se o ativo foi versionado no Git, ele tem prioridade sobre a imagem antiga do Netlify.
    await fs.access(source);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(source, target);
    count++;
    continue;
  } catch {
    // Ativos antigos ainda podem ser recuperados da publicação atual durante a migração.
  }
  try {
    const response = await fetch(`${SOURCE_ORIGIN}/${safe.split(path.sep).map(encodeURIComponent).join("/")}`, {
      redirect: "follow",
      headers: { "user-agent": "R-Contemporaneo-Asset-Sync/1.2" }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, Buffer.from(await response.arrayBuffer()));
    count++;
  } catch (error) {
    failed.push(`${safe}: ${error.message}`);
  }
}

console.log(`Ativos recuperados de ${SOURCE_ORIGIN}: ${count}/${refs.size}`);
if (failed.length) {
  console.error("Build interrompido para evitar publicar o site sem imagens/ícones:");
  for (const item of failed) console.error(" - " + item);
  throw new Error("Não foi possível recuperar todos os ativos da publicação atual.");
}
