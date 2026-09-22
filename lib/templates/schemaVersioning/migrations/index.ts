import { type TemplateMigration } from "./types";
import { migrateFrom1To2 } from "./1-to-2";
import { migrateFrom2To3 } from "./2-to-3";

// The template schema version new templates and fully-migrated templates carry.
export const CURRENT_TEMPLATE_VERSION = 3;

// One file per migration, named for the version it upgrades FROM
// (e.g. `1-to-2.ts` exports the migration from version 1 to 2), registered
// here keyed by that version.
export const migrations: Record<number, TemplateMigration> = {
  1: migrateFrom1To2,
  2: migrateFrom2To3,
};
