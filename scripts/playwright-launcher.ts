import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { stdout as output } from "node:process";

type Mode = "playwright:headless:local" | "playwright:ui:local";

type CliState = {
  mode: Mode;
  selectedFiles: Set<string>;
};

type TestTreeNode = {
  name: string;
  relativePath: string;
  directories: TestTreeNode[];
  files: string[];
};

const repoRoot = process.cwd();
const testsRoot = path.join(repoRoot, "tests", "e2e");
const launcherAssetsRoot = path.join(repoRoot, "scripts", "playwright-launcher");
const validFileExtensions = [".spec.ts", ".spec.tsx"];

const usage = `Playwright launcher

Usage:
  yarn playwright:launch
  yarn playwright:launch -- --mode ui --files tests/e2e/smoke.spec.ts
  yarn playwright:launch -- --list

Options:
  --mode <ui|headless>   Skip the mode prompt
  --files <a,b,c>        Run one or more test files without prompting
  --list                 Print discovered e2e test files and exit
  --help                 Show this help text
`;

function isTestFile(name: string) {
  return validFileExtensions.some((extension) => name.endsWith(extension));
}

function toWorkspacePath(absolutePath: string) {
  return path.relative(repoRoot, absolutePath).split(path.sep).join(path.posix.sep);
}

async function collectTestFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return collectTestFiles(absolutePath);
      }
      return isTestFile(entry.name) ? [toWorkspacePath(absolutePath)] : [];
    })
  );

  return files.flat().sort((left, right) => left.localeCompare(right));
}

async function buildTree(currentDir: string): Promise<TestTreeNode> {
  const relativePath = path.relative(testsRoot, currentDir).split(path.sep).join(path.posix.sep);
  const entries = await readdir(currentDir, { withFileTypes: true });

  const directories = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((entry) => buildTree(path.join(currentDir, entry.name)))
  );

  const files = entries
    .filter((entry) => !entry.isDirectory() && isTestFile(entry.name))
    .map((entry) => toWorkspacePath(path.join(currentDir, entry.name)))
    .sort((left, right) => left.localeCompare(right));

  return {
    name: path.basename(currentDir),
    relativePath,
    directories,
    files,
  };
}

function parseArgs(argv: string[]) {
  let requestedMode: Mode | undefined;
  let files: string[] = [];
  let shouldList = false;
  let shouldShowHelp = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help") {
      shouldShowHelp = true;
      continue;
    }

    if (arg === "--list") {
      shouldList = true;
      continue;
    }

    if (arg === "--mode") {
      const nextValue = argv[index + 1];
      index += 1;
      requestedMode =
        nextValue === "ui"
          ? "playwright:ui:local"
          : nextValue === "headless"
            ? "playwright:headless:local"
            : undefined;
      continue;
    }

    if (arg === "--files") {
      const nextValue = argv[index + 1] ?? "";
      index += 1;
      files = nextValue
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    }
  }

  return { requestedMode, files, shouldList, shouldShowHelp };
}

function runPlaywright(state: CliState) {
  const selectedFiles = [...state.selectedFiles].sort((left, right) => left.localeCompare(right));

  if (selectedFiles.length === 0) {
    output.write("\nSelect at least one file before running.\n");
    return;
  }

  output.write(`\nRunning ${state.mode} for ${selectedFiles.length} file(s)...\n\n`);

  const child = spawn("yarn", [state.mode, "--", ...selectedFiles], {
    cwd: repoRoot,
    stdio: "inherit",
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

function openBrowser(url: string) {
  const command =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  const child = spawn(command, [url], {
    stdio: "ignore",
    detached: true,
    shell: process.platform === "win32",
  });
  child.unref();
}

function contentTypeForPath(assetPath: string) {
  if (assetPath.endsWith(".css")) return "text/css; charset=utf-8";
  if (assetPath.endsWith(".js")) return "application/javascript; charset=utf-8";
  return "text/html; charset=utf-8";
}

async function startWebMode(initialMode?: Mode) {
  const tree = await buildTree(testsRoot);
  const mode = initialMode ?? "playwright:headless:local";

  const server = createServer(async (req, res) => {
    const requestUrl = new URL(req.url ?? "/", "http://127.0.0.1");

    if (req.method === "GET" && requestUrl.pathname === "/") {
      const html = await readFile(path.join(launcherAssetsRoot, "index.html"), "utf8");
      res.writeHead(200, { "content-type": contentTypeForPath("index.html") });
      res.end(html);
      return;
    }

    if (req.method === "GET" && requestUrl.pathname === "/api/state") {
      res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ tree, initialMode: mode }));
      return;
    }

    if (req.method === "GET" && requestUrl.pathname === "/favicon.ico") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === "GET") {
      const relativeAssetPath = requestUrl.pathname.replace(/^\//, "");
      const assetPath = path.normalize(path.join(launcherAssetsRoot, relativeAssetPath));

      if (!assetPath.startsWith(launcherAssetsRoot)) {
        res.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
        res.end("Forbidden");
        return;
      }

      try {
        const asset = await readFile(assetPath, "utf8");
        res.writeHead(200, { "content-type": contentTypeForPath(assetPath) });
        res.end(asset);
        return;
      } catch {
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        res.end("Not found");
        return;
      }
    }

    if (req.method === "POST" && requestUrl.pathname === "/run") {
      const body = await new Promise<string>((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        req.on("error", reject);
      });

      const parsed = JSON.parse(body) as { mode?: Mode; files?: string[] };
      const selectedFiles = new Set((parsed.files ?? []).filter(Boolean));
      const selectedMode = parsed.mode ?? mode;

      res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      res.end(
        JSON.stringify({
          message: `Started ${selectedMode} for ${selectedFiles.size} selected file(s). Check the terminal for output.`,
        })
      );

      server.close(() => {
        runPlaywright({
          mode: selectedMode,
          selectedFiles,
        });
      });
      return;
    }

    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Could not start Playwright launcher server.");
  }

  const url = `http://127.0.0.1:${address.port}`;
  output.write(`\nOpened Playwright launcher at ${url}\n`);
  output.write(
    "Use the browser UI to click into directories, select one or more files, and run them.\n\n"
  );
  openBrowser(url);
}

async function main() {
  const { requestedMode, files, shouldList, shouldShowHelp } = parseArgs(process.argv.slice(2));

  if (shouldShowHelp) {
    output.write(usage);
    return;
  }

  if (shouldList) {
    const tests = await collectTestFiles(testsRoot);
    tests.forEach((file) => output.write(`${file}\n`));
    return;
  }

  if (files.length > 0) {
    const mode = requestedMode ?? "playwright:headless:local";
    runPlaywright({
      mode,
      selectedFiles: new Set(files),
    });
    return;
  }

  await startWebMode(requestedMode);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
