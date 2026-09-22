import { type TemplateMigration } from "./types";

// Version 0 is any template with no explicit `schemaVersion` field. This migration
// makes that implicit state explicit; it does not change the template shape.
export const addSchemaVersionProperty: TemplateMigration = (template) => ({
  ...template,
  schemaVersion: 1,
});
