import { type FormProperties } from "@gcforms/types";
import { CURRENT_TEMPLATE_VERSION, migrations as defaultMigrations } from "./migrations";
import { type TemplateMigration } from "./migrations/types";

// Missing version is not a special case, it's implicitly version 1.
export const getTemplateVersion = (template: FormProperties): number => template.version ?? 0;

/**
 * Migrates a template's jsonConfig up to the target version by applying
 * registered migrations in sequence. Callers are responsible for only
 * invoking this on the builder/draft side, never on published templates.
 */
export const migrateTemplate = (
  template: FormProperties,
  options: {
    migrations?: Record<number, TemplateMigration>;
    targetVersion?: number;
  } = {}
): FormProperties => {
  const { migrations = defaultMigrations, targetVersion = CURRENT_TEMPLATE_VERSION } = options;

  let migrated = template;
  let version = getTemplateVersion(migrated);

  while (version < targetVersion) {
    // migrations is keyed by the version it upgrades TO, e.g. migrations[1] takes version 0 to 1.
    const migrate = migrations[version + 1];
    if (!migrate) {
      throw new Error(`No migration registered to upgrade template from version ${version}`);
    }

    migrated = migrate(migrated);

    const nextVersion = getTemplateVersion(migrated);
    if (nextVersion <= version) {
      throw new Error(`Migration from version ${version} did not advance the template version`);
    }
    version = nextVersion;
  }

  return { ...migrated, version: targetVersion };
};
