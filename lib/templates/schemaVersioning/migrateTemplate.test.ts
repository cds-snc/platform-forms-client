import { afterEach, describe, it, expect, vi } from "vitest";
import { type FormProperties } from "@gcforms/types";
import { logMessage } from "@lib/logger";
import { getTemplateSchemaVersion, migrateTemplate } from "./migrateTemplate";
import { CURRENT_TEMPLATE_VERSION } from "./migrations";

const baseTemplate = {
  titleEn: "Title",
  titleFr: "Titre",
  layout: [],
  elements: [],
} as unknown as FormProperties;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getTemplateSchemaVersion", () => {
  it("treats a missing version as version 0", () => {
    expect(getTemplateSchemaVersion(baseTemplate)).toBe(0);
  });

  it("returns the explicit version when present", () => {
    expect(getTemplateSchemaVersion({ ...baseTemplate, schemaVersion: 3 })).toBe(3);
  });
});

describe("migrateTemplate", () => {
  it("migrates a template with no version to the current version via the real migration chain", () => {
    const migrated = migrateTemplate(baseTemplate);
    expect(migrated.schemaVersion).toBe(CURRENT_TEMPLATE_VERSION);
    expect(migrated.schemaVersion).toBe(1);
  });

  it("is a no-op (aside from stamping) when already at the target version", () => {
    const template = { ...baseTemplate, schemaVersion: CURRENT_TEMPLATE_VERSION };
    const migrated = migrateTemplate(template);
    expect(migrated).toEqual(template);
  });

  it("does not downgrade a template newer than the target version", () => {
    const template = { ...baseTemplate, schemaVersion: 2 };
    const migrated = migrateTemplate(template, { targetVersion: 1 });

    expect(migrated).toEqual(template);
  });

  it("applies registered migrations in sequence up to the target version", () => {
    const template = { ...baseTemplate, schemaVersion: 1 };
    const migrated = migrateTemplate(template, {
      targetVersion: 3,
      migrations: {
        2: (template) => ({ ...template, schemaVersion: 2, titleEn: "migrated-to-2" }),
        3: (template) => ({ ...template, schemaVersion: 3, titleEn: "migrated-to-3" }),
      },
    });

    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.titleEn).toBe("migrated-to-3");
  });

  it("throws if no migration is registered for the template's version", () => {
    expect(() => migrateTemplate(baseTemplate, { targetVersion: 2, migrations: {} })).toThrow(
      /No migration registered/
    );
  });

  it("logs and keeps the previous version if a migration does not advance", () => {
    const logError = vi.spyOn(logMessage, "error").mockImplementation(() => {});
    const migrated = migrateTemplate(baseTemplate, {
      targetVersion: 2,
      migrations: { 1: (template) => ({ ...template }) },
    });

    expect(migrated).toEqual(baseTemplate);
    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining("Migration from schema version 0 to 1 failed; keeping version 0")
    );
  });

  it("keeps the last successful version when a migration mutates then throws", () => {
    const logError = vi.spyOn(logMessage, "error").mockImplementation(() => {});
    const template = { ...baseTemplate, schemaVersion: 1 };
    const migrated = migrateTemplate(template, {
      targetVersion: 2,
      migrations: {
        2: (input) => {
          input.titleEn = "partial change";
          throw new Error("migration failed");
        },
      },
    });

    expect(migrated).toEqual(template);
    expect(migrated.schemaVersion).toBe(1);
    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining(
        "Migration from schema version 1 to 2 failed; keeping version 1: migration failed"
      )
    );
  });

  it("retains successful earlier steps and stops after the first failed step", () => {
    const logError = vi.spyOn(logMessage, "error").mockImplementation(() => {});
    const laterMigration = vi.fn();
    const migrated = migrateTemplate(baseTemplate, {
      targetVersion: 3,
      migrations: {
        1: (template) => ({ ...template, schemaVersion: 1, titleEn: "successful change" }),
        2: (template) => {
          template.elements.push({
            id: 1,
            type: "textField",
            properties: { titleEn: "partial change", titleFr: "" },
          });
          throw new Error("migration failed");
        },
        3: laterMigration,
      },
    });

    expect(migrated).toEqual({
      ...baseTemplate,
      schemaVersion: 1,
      titleEn: "successful change",
    });
    expect(baseTemplate.elements).toEqual([]);
    expect(laterMigration).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining(
        "Migration from schema version 1 to 2 failed; keeping version 1: migration failed"
      )
    );
  });
});
