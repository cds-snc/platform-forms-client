import { Validator } from "jsonschema";
import { type FormProperties } from "@lib/types";
import { BODY_SIZE_LIMIT } from "@root/constants";
import { cleanAngleBrackets } from "@lib/client/jsonFormatting";
import { validateTemplate } from "@lib/utils/form-builder/validate";
import { getTemplateSchema } from "@lib/templates/schemas/templates";
import {
  getTemplateSchemaVersion,
  migrateTemplate,
} from "@lib/templates/schemaVersioning/migrateTemplate";
import { getTemplateMigrationProblems } from "@lib/templates/schemaVersioning/getTemplateMigrationProblems";
import { CURRENT_TEMPLATE_VERSION } from "@lib/templates/schemaVersioning/migrations";

type ErrorInfo = { name: string; message: string };

const toErrorInfo = (e: unknown): ErrorInfo => {
  const error = e instanceof Error ? e : new Error(String(e));
  return { name: error.name, message: error.message };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Migrates a template to the latest schema version and validates it, returning
 * both the parsed `validateTemplate` output and the raw jsonschema result.
 */
export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return Response.json({ error: "Unsupported media type" }, { status: 415 });
  }

  if (Number(request.headers.get("content-length") ?? 0) > BODY_SIZE_LIMIT) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (new TextEncoder().encode(rawBody).byteLength > BODY_SIZE_LIMIT) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }

  let template: unknown;
  try {
    template = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isRecord(template) || !Array.isArray(template.elements)) {
    return Response.json({ error: "Body must be a template object" }, { status: 400 });
  }

  const input = template as unknown as FormProperties;
  const fromVersion = getTemplateSchemaVersion(input);

  let migrated = input;
  let problems: ReturnType<typeof getTemplateMigrationProblems> = [];
  let migrationError: ErrorInfo | undefined;

  try {
    problems = getTemplateMigrationProblems(structuredClone(input));
    migrated = migrateTemplate(structuredClone(input), { logFailure: false });
  } catch (e) {
    // Malformed templates can break migration; still validate them as-is.
    migrationError = toErrorInfo(e);
  }

  // Validate against the latest schema even if migration stopped at an earlier version.
  const latest = { ...migrated, schemaVersion: CURRENT_TEMPLATE_VERSION };

  let validateTemplateResult: ReturnType<typeof validateTemplate> | { error: ErrorInfo };
  try {
    validateTemplateResult = validateTemplate(structuredClone(latest));
  } catch (e) {
    validateTemplateResult = { error: toErrorInfo(e) };
  }

  try {
    const schemaResult = new Validator().validate(
      structuredClone(latest),
      getTemplateSchema(CURRENT_TEMPLATE_VERSION),
      { preValidateProperty: cleanAngleBrackets }
    );

    return Response.json({
      schemaVersion: CURRENT_TEMPLATE_VERSION,
      migration: {
        fromVersion,
        toVersion: getTemplateSchemaVersion(migrated),
        problems,
        ...(migrationError && { error: migrationError }),
      },
      validateTemplate: validateTemplateResult,
      schema: {
        valid: schemaResult.valid,
        errors: schemaResult.errors,
      },
    });
  } catch (e) {
    return Response.json({ error: "Validation failed", ...toErrorInfo(e) }, { status: 500 });
  }
}
