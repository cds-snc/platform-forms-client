import { type Schema, Validator } from "jsonschema";
import { type FormElement } from "@gcforms/types";
import { getTemplateSchema } from "@lib/templates/schemas/templates";
import { type TemplateMigration } from "./types";

type StrictElementBranch = {
  properties?: {
    type?: { const?: unknown };
    properties?: {
      allOf?: {
        propertyNames?: { pattern?: string };
        properties?: { validation?: { $ref?: string } };
      }[];
    };
  };
};

type StrictElementPropertiesSchema = {
  oneOf: StrictElementBranch[];
};

type JsonObject = Record<string, unknown>;

const defaultDynamicRowProperties = {
  rowTitleEn: "Entry",
  rowTitleFr: "Entrée",
  addButtonTextEn: "Add",
  addButtonTextFr: "Ajouter",
  removeButtonTextEn: "Remove",
  removeButtonTextFr: "Supprimer",
};

const templateSchemaV2 = getTemplateSchema(2);
const definitions = templateSchemaV2.definitions ?? {};
const strictElementSchema = definitions.elementStrict as StrictElementPropertiesSchema;

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getStrictBranch = (type: string, path: string): StrictElementBranch => {
  const branch = strictElementSchema.oneOf.find(
    ({ properties }) => properties?.type?.const === type
  );

  if (!branch) {
    throw new Error(`Cannot migrate unsupported element type "${type}" at ${path}`);
  }

  return branch;
};

const filterValidationProperties = (
  properties: JsonObject,
  branch: StrictElementBranch
): JsonObject => {
  const validation = properties.validation;
  if (!isJsonObject(validation)) return properties;

  const validationRef = branch.properties?.properties?.allOf?.[1]?.properties?.validation?.$ref;
  const validationDefinitionName = validationRef?.split("/").at(-1);
  const validationDefinition = validationDefinitionName
    ? (definitions[validationDefinitionName] as Schema | undefined)
    : undefined;
  const allowedValidationProperties = validationDefinition?.properties;

  if (!allowedValidationProperties) return properties;

  return {
    ...properties,
    validation: Object.fromEntries(
      Object.entries(validation).filter(([key]) =>
        Object.prototype.hasOwnProperty.call(allowedValidationProperties, key)
      )
    ),
  };
};

const normalizeDynamicRowProperties = (value: unknown): unknown => {
  if (value === undefined) return { ...defaultDynamicRowProperties };
  if (!isJsonObject(value)) return value;

  return Object.fromEntries(
    Object.entries(defaultDynamicRowProperties).map(([key, fallback]) => [
      key,
      value[key] === undefined ? fallback : value[key],
    ])
  );
};

const migrateElement = (value: unknown, path: string, isSubElement = false): FormElement => {
  if (!isJsonObject(value) || typeof value.type !== "string" || !isJsonObject(value.properties)) {
    throw new Error(`Cannot migrate malformed element at ${path}`);
  }

  let type = value.type;
  let properties = { ...value.properties };

  if (type === "textField" && isJsonObject(properties.validation)) {
    if (properties.validation.type === "number") {
      type = "numberInput";
      properties.validation = { ...properties.validation };
      delete (properties.validation as JsonObject).type;
    }
  }

  const branch = getStrictBranch(type, path);
  if (branch.properties?.properties?.allOf?.[1]?.properties?.validation) {
    // Older templates sometimes omitted validation or its required flag. Make these controls
    // optional by default; attestations use the separate `all` flag and require every checkbox.
    const validation = isJsonObject(properties.validation) ? { ...properties.validation } : {};
    const requiredFlag = type === "attestation" ? "all" : "required";
    if (validation[requiredFlag] === undefined) {
      validation[requiredFlag] = type === "attestation";
    }
    properties.validation = validation;
  }

  const propertyPattern = branch.properties?.properties?.allOf?.[1]?.propertyNames?.pattern;
  if (!propertyPattern) {
    throw new Error(`Missing strict property rules for element type "${type}" at ${path}`);
  }

  const allowedProperty = new RegExp(propertyPattern);
  properties = Object.fromEntries(
    Object.entries(properties).filter(([key]) => allowedProperty.test(key))
  );

  if (isSubElement) {
    delete properties.conditionalRules;
  }

  properties = filterValidationProperties(properties, branch);

  if (
    type === "combobox" &&
    properties.managedChoices !== undefined &&
    Array.isArray(properties.choices) &&
    properties.choices.length === 0
  ) {
    delete properties.choices;
  }

  if (type === "dynamicRow" && Array.isArray(properties.subElements)) {
    properties.subElements = properties.subElements.map((subElement, index) =>
      migrateElement(subElement, `${path}.properties.subElements.${index}`, true)
    );
  }

  if (type === "dynamicRow")
    properties.dynamicRow = normalizeDynamicRowProperties(properties.dynamicRow);

  return { ...value, type, properties } as unknown as FormElement;
};

export const migrateToStrictElementSchemas: TemplateMigration = (template) => {
  if (!Array.isArray(template.elements)) {
    throw new Error("Cannot migrate template without an elements array");
  }

  const elements = template.elements.map((element, index) =>
    migrateElement(element, `elements.${index}`)
  );
  const validator = new Validator();
  const errors = elements.flatMap((element, index) => {
    const branch = getStrictBranch(element.type, `elements.${index}`);
    const validationResult = validator.validate(element, {
      ...(branch as Schema),
      definitions,
    });

    return validationResult.errors
      .filter(({ name }) => !["allOf", "anyOf", "oneOf"].includes(name))
      .map(({ property, message }) => {
        const elementPath = `elements[${index}]`;
        return `${property.replace(/^instance/, elementPath)}: ${message}`;
      });
  });

  if (errors.length > 0) {
    throw new Error(`Cannot migrate template elements to schema version 2: ${errors}`);
  }

  return { ...template, schemaVersion: 2, elements };
};
