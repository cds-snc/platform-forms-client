"use client";

import { ReactElement } from "react";
import { FormElement, FormElementTypes } from "@lib/types";
import { TextInputPlugin } from "@clientComponents/forms/TextInput/TextInputPlugin";
import { ComponentPlugin } from "./ComponentPlugin";

const plugins: ComponentPlugin[] = [TextInputPlugin];

export const elementRegistry = Object.fromEntries(plugins.map((p) => [p.meta.type, p])) as Record<
  FormElementTypes,
  ComponentPlugin
>;

function renderElement(element: FormElement, lang: string): ReactElement | null {
  return elementRegistry[element.type]?.render({ element, lang }) ?? null;
}
export const GeneratePluginElement = (element: FormElement, lang: string): ReactElement | null => {
  return renderElement(element, lang);
};
