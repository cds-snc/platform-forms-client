import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const workspaceRoot = "/Users/tim.arney/projects/platform-forms-client";
const defaultConsumerRoot = "/Users/tim.arney/projects/forms-account";
const consumerRoot = process.env.FORMS_ACCOUNT_PATH || defaultConsumerRoot;
const tarballPath = "/tmp/gcforms-core-local.tgz";
const shouldVerify = !process.argv.includes("--no-verify");

const run = (command, args, cwd = workspaceRoot) => {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
};

if (!existsSync(consumerRoot)) {
  throw new Error(`Consumer repo not found: ${consumerRoot}`);
}

run("yarn", ["workspace", "@gcforms/core", "pack", "--out", tarballPath]);
run("pnpm", ["add", tarballPath], consumerRoot);

if (shouldVerify) {
  run("pnpm", ["build"], consumerRoot);
}

const mode = shouldVerify ? "installed and verified" : "installed";
console.log(`@gcforms/core ${mode} in ${path.resolve(consumerRoot)}`);
