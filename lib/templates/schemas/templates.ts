import { type Schema } from "jsonschema";
import templatesSchemaV1 from "./templates.schema.v1.json";
import templatesSchemaV2 from "./templates.schema.v2.json";

const templatesSchemas: Record<number, Schema> = {
  1: templatesSchemaV1,
  2: templatesSchemaV2,
};

/**
 * Returns the validation schema for a template version. Historical templates
 * without an explicit schemaVersion are treated as version 1.
 */
export const getTemplateSchema = (schemaVersion?: number): Schema => {
  const version = schemaVersion === undefined ? 1 : schemaVersion;
  const schema = templatesSchemas[version];

  if (!Number.isInteger(version) || !schema) {
    throw new Error(`Unsupported template schema version: ${version}`);
  }

  return schema;
};
