import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { type FormProperties } from "@gcforms/types";
import { logMessage } from "@lib/logger";
import {
  getTemplateSchemaVersion,
  migrateTemplate,
} from "@lib/templates/schemaVersioning/migrateTemplate";
import { CURRENT_TEMPLATE_VERSION } from "@lib/templates/schemaVersioning/migrations";

type MigrationFailure = {
  fileName: string;
  reason: string;
};

const compatibilityFixturesDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "json-files"
);

describe("template compatibility fixtures", () => {
  it.skipIf(process.env.RUN_TEMPLATE_COMPATIBILITY !== "true")(
    "reports how many compatibility fixtures migrate to the current schema",
    () => {
      const fileNames = readdirSync(compatibilityFixturesDirectory)
        .filter((fileName) => fileName.endsWith(".json"))
        .sort();
      const failures: MigrationFailure[] = [];
      let migratedCount = 0;
      const migrationLog = vi.spyOn(logMessage, "warn").mockImplementation(() => {});

      try {
        for (const fileName of fileNames) {
          const logCountBeforeMigration = migrationLog.mock.calls.length;

          try {
            // Read and migrate one fixture at a time to limit memory use for the 200 MB corpus.
            const fixture = JSON.parse(
              readFileSync(resolve(compatibilityFixturesDirectory, fileName), "utf8")
            ) as FormProperties;
            const migrated = migrateTemplate(fixture);

            if (getTemplateSchemaVersion(migrated) === CURRENT_TEMPLATE_VERSION) {
              migratedCount++;
              continue;
            }

            const migrationError = migrationLog.mock.calls
              .slice(logCountBeforeMigration)
              .map(([message]) => String(message))
              .at(-1);

            failures.push({
              fileName,
              reason:
                migrationError ?? `Stopped at schema version ${getTemplateSchemaVersion(migrated)}`,
            });
          } catch (error) {
            failures.push({
              fileName,
              reason: error instanceof Error ? error.message : String(error),
            });
          }
        }
      } finally {
        migrationLog.mockRestore();
      }

      const failedCount = failures.length;
      process.stdout.write(
        `[template compatibility] ${migratedCount}/${fileNames.length} migrated successfully; ${failedCount} could not be migrated.\n`
      );

      if (failedCount > 0) {
        const displayedFailures = failures.slice(0, 25);
        process.stdout.write(
          [
            `First ${displayedFailures.length} migration failure(s):`,
            ...displayedFailures.map(({ fileName, reason }) => `- ${fileName}: ${reason}`),
            failedCount > displayedFailures.length
              ? `...and ${failedCount - displayedFailures.length} more.`
              : "",
          ]
            .filter(Boolean)
            .join("\n") + "\n"
        );
      }

      expect(failedCount).toBe(0);
    },
    10 * 60 * 1000
  );
});
