import { execSync } from "node:child_process";

console.log("⚡ Executando compilação do projeto React (Vite)...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("✅ Build concluído com sucesso!");
} catch (error) {
  console.error("❌ Falha na compilação:", error);
  process.exit(1);
}
