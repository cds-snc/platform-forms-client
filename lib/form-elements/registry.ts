import { FormElementTypes } from "@lib/types";
import { type ClientElementDefinition } from "./clientHooks";
import { type SharedElementDefinition } from "./sharedHooks";
import { formattedDateDefinition } from "./formattedDate";
import { numberInputDefinition } from "./numberInput";

type ElementDefinition = ClientElementDefinition & SharedElementDefinition;

const elementDefinitions: Partial<Record<FormElementTypes, ElementDefinition>> = {
  [FormElementTypes.formattedDate]: formattedDateDefinition,
  [FormElementTypes.numberInput]: numberInputDefinition,
};

export const getElementDefinition = (type: FormElementTypes | undefined) => {
  if (!type) {
    return undefined;
  }

  return elementDefinitions[type];
};

export const getClientElementDefinition = (type: FormElementTypes | undefined) => {
  return getElementDefinition(type);
};

export const getSharedElementDefinition = (type: FormElementTypes | undefined) => {
  return getElementDefinition(type);
};
