import { FormElementTypes } from "@lib/types";
import { type ClientElementDefinition } from "./clientHooks";
import { type SharedElementDefinition } from "./sharedHooks";
import { publicDefinition as formattedDatePublic } from "./formattedDate/public";
import { builderDefinition as formattedDateBuilder } from "./formattedDate/builder";
import { sharedDefinition as formattedDateShared } from "./formattedDate/shared";
import { publicDefinition as numberInputPublic } from "./numberInput/public";
import { builderDefinition as numberInputBuilder } from "./numberInput/builder";
import { fileInputDefinition as fileInputShared } from "./fileInput";
import { publicDefinition as fileInputPublic } from "./fileInput/public";

type ElementParts = {
  public?: ClientElementDefinition;
  builder?: ClientElementDefinition;
  shared?: SharedElementDefinition;
};

const elementDefinitions: Partial<Record<FormElementTypes, ElementParts>> = {
  [FormElementTypes.formattedDate]: {
    public: formattedDatePublic,
    builder: formattedDateBuilder,
    shared: formattedDateShared,
  },
  [FormElementTypes.numberInput]: {
    public: numberInputPublic,
    builder: numberInputBuilder,
  },
  [FormElementTypes.fileInput]: {
    public: fileInputPublic,
    shared: fileInputShared,
  },
};

const mergeClientDefs = (
  publicDef?: ClientElementDefinition,
  builderDef?: ClientElementDefinition
): ClientElementDefinition | undefined => {
  if (!publicDef && !builderDef) return undefined;
  return { ...(publicDef || {}), ...(builderDef || {}) } as ClientElementDefinition;
};

export const getClientElementDefinition = (type: FormElementTypes | undefined) => {
  if (!type) return undefined;
  const parts = elementDefinitions[type];
  return mergeClientDefs(parts?.public, parts?.builder);
};

export const getSharedElementDefinition = (type: FormElementTypes | undefined) => {
  if (!type) return undefined;
  return elementDefinitions[type]?.shared;
};

// Backwards-compatible aggregate getter for tests and transitional call sites
export const getElementDefinition = (type: FormElementTypes | undefined) => {
  if (!type) return undefined;
  const parts = elementDefinitions[type];
  return {
    ...(parts?.shared || {}),
    ...(mergeClientDefs(parts?.public, parts?.builder) || {}),
  } as ClientElementDefinition & SharedElementDefinition;
};
