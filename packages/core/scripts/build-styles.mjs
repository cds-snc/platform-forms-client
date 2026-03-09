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
const tmpDir = path.join(packageRoot, ".tmp", "styles");
const entries = ["forms", "header", "gc-header", "icons"];

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

rmSync(tmpDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });
mkdirSync(distStylesDir, { recursive: true });
rmSync(packageStylesDir, { recursive: true, force: true });
cpSync(sourceDir, packageStylesDir, { recursive: true });

for (const entry of entries) {
  const inputFile = path.join(sourceDir, `${entry}.scss`);
  const intermediateFile = path.join(tmpDir, `${entry}.css`);
  const outputFile = path.join(distStylesDir, `${entry}.css`);
  const packageCssFile = path.join(packageStylesDir, `${entry}.css`);

  run(binPath("sass"), ["--no-source-map", inputFile, intermediateFile]);
  run(binPath("tailwindcss"), [
    "--config",
    path.join(packageRoot, "tailwind.build.config.js"),
    "--input",
    intermediateFile,
    "--output",
    outputFile,
  ]);

  cpSync(outputFile, packageCssFile);
}

const sourceAssetsDir = path.join(packageRoot, "src", "assets");
const distAssetsDir = path.join(distDir, "assets");

if (existsSync(sourceAssetsDir)) {
  rmSync(distAssetsDir, { recursive: true, force: true });
  mkdirSync(distAssetsDir, { recursive: true });
  cpSync(sourceAssetsDir, distAssetsDir, { recursive: true });
}

rmSync(tmpDir, { recursive: true, force: true });
