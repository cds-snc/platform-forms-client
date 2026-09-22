import { type TemplateMigration } from "./types";

// Version 3 activates strict, per-element-type schema validation
// (see templates.schema.json's elementStrict definitions). This migration
// only stamps the version; it does not repair elements that don't already
// conform to the stricter shape. That's deliberately a separate, later
// migration so this change can land without a data-repair dependency.
export const migrateFrom2To3: TemplateMigration = (template) => ({
  ...template,
  version: 3,
});
