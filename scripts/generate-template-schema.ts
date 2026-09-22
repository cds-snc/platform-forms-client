import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createGenerator } from "ts-json-schema-generator";

const root = resolve(import.meta.dirname, "..");
const config = {
  path: resolve(root, "packages/types/src/template-types.ts"),
  tsconfig: resolve(root, "tsconfig.json"),
  type: "DownloadableFormTemplate",
  expose: "export" as const,
  jsDoc: "extended" as const,
  functions: "fail" as const,
};

const schema = createGenerator(config).createSchema(config.type);
schema.$id = "https://forms-formulaires.alpha.canada.ca/template.schema.json";

writeFileSync(
  resolve(root, "lib/middleware/schemas/templates.schema.json"),
  `${JSON.stringify(schema, null, 2)}\n`,
  "utf8"
);
