#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const baseRef = process.argv[2];
if (!baseRef) {
  throw new Error("Usage: node scripts/check-removed-settings.mjs <base-ref>");
}

const fixturePath = "packages/database/src/fixtures/settings.ts";
const baseFixture = execFileSync("git", ["show", `${baseRef}:${fixturePath}`], {
  encoding: "utf8",
});
const currentFixture = readFileSync(fixturePath, "utf8");

const getSettingIds = (source) => {
  const allSettings = source.match(/const allSettings\s*=\s*\[([\s\S]*?)\];/);
  if (!allSettings) throw new Error(`Could not find allSettings array in ${fixturePath}`);

  const settingNames = [...allSettings[1].matchAll(/\b([A-Za-z_$][\w$]*)\b/g)].map(
    ([, settingName]) => settingName
  );
  const ids = new Set();

  for (const settingName of settingNames) {
    const declaration = source.match(
      new RegExp(
        `const\\s+${settingName}\\s*:\\s*(?:SettingFixture|Setting)\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`
      )
    );
    const internalId = declaration?.[1].match(/internalId:\s*["']([^"']+)["']/)?.[1];
    if (!internalId)
      throw new Error(`Could not find internalId for ${settingName} in ${fixturePath}`);
    ids.add(internalId);
  }

  return ids;
};

const previousIds = getSettingIds(baseFixture);
const currentIds = getSettingIds(currentFixture);
const removedIds = [...previousIds].filter((internalId) => !currentIds.has(internalId));

const sourcePaths = ["app", "components", "lib", "packages", "scripts", "utils"];
const excludedPaths = [
  ":(exclude)packages/database/src/fixtures/settings.ts",
  ":(exclude)packages/database/prisma/migrations/**",
];
const remainingReferences = [];

for (const internalId of removedIds) {
  const result = spawnSync(
    "git",
    ["grep", "-n", "-F", "-e", internalId, "--", ...sourcePaths, ...excludedPaths],
    { encoding: "utf8" }
  );

  if (result.status === 0) {
    remainingReferences.push(`${internalId}:\n${result.stdout.trim()}`);
  } else if (result.status !== 1) {
    throw new Error(result.stderr || `git grep failed for ${internalId}`);
  }
}

if (remainingReferences.length > 0) {
  process.stderr.write(
    [
      "Settings were removed from the fixture but are still referenced in application code:",
      ...remainingReferences,
      "Remove or migrate these references in the same change before retiring the setting.",
    ].join("\n\n") + "\n"
  );
  process.exit(1);
}

const message =
  removedIds.length === 0
    ? "No settings were removed from the fixture."
    : `Verified ${removedIds.length} removed setting(s) have no remaining code references.`;
process.stdout.write(`${message}\n`);
