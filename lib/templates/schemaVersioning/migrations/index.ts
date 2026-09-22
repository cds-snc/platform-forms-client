import { type TemplateMigration } from "./types";
import { addVersionProperty } from "./v0001_addVersionProperty";

// One file per migration, named for the version it upgrades TO
// (e.g. `v0001_addVersionProperty.ts` exports the migration from version 0 to 1),
// registered here keyed by that version.
export const migrations: Record<number, TemplateMigration> = {
  1: addVersionProperty,
};

// The template schema version new templates and fully-migrated templates carry.
export const CURRENT_TEMPLATE_VERSION = Math.max.apply(null, Object.keys(migrations).map(Number));
