import { type TemplateMigration } from "./types";

// Version 1 is any template with no explicit `version` field. This migration
// makes that implicit state explicit; it does not change the template shape.
export const addVersionProperty: TemplateMigration = (template) => ({
  ...template,
  version: 1,
});
