import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(packageRoot, "..", "..");
const sourceDir = path.join(packageRoot, "src", "styles");
const distDir = path.join(packageRoot, "dist");
const distStylesDir = path.join(distDir, "styles");
const packageStylesDir = path.join(packageRoot, "styles");
const entries = ["forms", "header", "gc-header", "icons", "typography", "toast"];

const run = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: workspaceRoot,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
};

const binPath = (name) => path.join(workspaceRoot, "node_modules", ".bin", name);

mkdirSync(distStylesDir, { recursive: true });
rmSync(packageStylesDir, { recursive: true, force: true });
cpSync(sourceDir, packageStylesDir, { recursive: true });

for (const entry of entries) {
  const inputFile = path.join(sourceDir, `${entry}.scss`);
  const outputFile = path.join(distStylesDir, `${entry}.css`);
  const packageCssFile = path.join(packageStylesDir, `${entry}.css`);

  // Sass compilation only — @apply directives survive in the output
  // and are resolved by the app's Tailwind v4 PostCSS pipeline
  run(binPath("sass"), ["--no-source-map", inputFile, outputFile]);

  cpSync(outputFile, packageCssFile);
}

const sourceAssetsDir = path.join(packageRoot, "src", "assets");
const distAssetsDir = path.join(distDir, "assets");

if (existsSync(sourceAssetsDir)) {
  rmSync(distAssetsDir, { recursive: true, force: true });
  mkdirSync(distAssetsDir, { recursive: true });
  cpSync(sourceAssetsDir, distAssetsDir, { recursive: true });
}
