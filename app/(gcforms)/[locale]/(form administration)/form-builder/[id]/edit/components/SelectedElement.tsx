"use client";
import React from "react";
import { FormElementTypes, ValidationInputType } from "@lib/types";

import { SubElement } from "./elements";
import { ElementOption, FormElementWithIndex } from "@lib/types/form-builder-types";
import { useElementOptions } from "@lib/hooks/form-builder/useElementOptions";
import { ConditionalIndicator } from "@formBuilder/components/shared/conditionals/ConditionalIndicator";
import { getPlugin } from "@root/plugins/form-elements/registry";

const filterSelected = (
  item: FormElementWithIndex,
  currentSelectedItem: ElementOption,
  elementOptions: ElementOption[]
) => {
  /**
   * Attestation is a special case. It is a checkbox, but it has a special validation type.
   * We want to check for that validation type and return the attestation type if it exists.
   */
  if (item.properties.validation?.all) {
    const selected = elementOptions.filter((item) => item.id === FormElementTypes.attestation);
    return selected && selected.length ? selected[0] : currentSelectedItem;
  }

  /**
   * If the item has an autoComplete property, set selected item to its corresponding pseudo-type
   */
  if (item.properties.autoComplete) {
    const autoCompleteValue = item.properties.autoComplete;
    const selected = elementOptions.filter((item) => item.id === autoCompleteValue);
    return selected && selected.length ? selected[0] : currentSelectedItem;
  }
  return currentSelectedItem;
};

const useGetSelectedOption = (item: FormElementWithIndex): ElementOption => {
  const elementOptions = useElementOptions();

  const validationType = item.properties?.validation?.type;
  const type = item.type;

  let selectedType: FormElementTypes | ValidationInputType = type;

  if (!type) {
    return elementOptions[1];
  } else if (type === FormElementTypes.numberInput) {
    // numberInput elements map to the "number" element option in the dialog
    selectedType = "number";
  } else if (type === "textField") {
    /**
     * Email, phone, and date fields are specialized text field types.
     * That is to say, their "type" is "textField" but they have specalized validation "type"s.
     * So if we have a "textField", we want to first check properties.validation.type to see if
     * it is a true Short Answer, or one of the other types.
     * The exceptions are validationType === "text" and validationType === "custom", for which
     * we want to return "textField" since "custom" is not a distinct element option.
     */
    selectedType =
      validationType && validationType !== "text" && validationType !== "custom"
        ? validationType
        : type;
  }

  const selected = elementOptions.filter((item) => item.id === selectedType);

  const filteredItem = filterSelected(
    item,
    selected && selected.length ? selected[0] : elementOptions[1],
    elementOptions
  );

  // For non-standard types, we want to set the id to the type as the type isn't avaliable in the elementOptions
  if (selectedType === "email") {
    filteredItem.id = "textField";
  }

  return filteredItem;
};

export const SelectedElement = ({
  item,
  elIndex = -1,
  formId,
}: {
  item: FormElementWithIndex;
  elIndex: number;
  formId: string;
}) => {
  let element = null;

  const selected = useGetSelectedOption(item);

  // Plugin-first dispatch: if a plugin is registered for this element type,
  // use its BuilderComponent. The plugin handles all sub-type variants
  // (e.g. email/phone/date for textField) internally.
  const plugin = getPlugin(item.type as FormElementTypes);
  if (plugin) {
    const { BuilderComponent } = plugin;
    element = <BuilderComponent item={item} elIndex={elIndex} formId={formId} />;
  } else {
    switch (selected.id) {
      case "dynamicRow":
        element = <SubElement item={item} elIndex={item.index} formId={formId} />;
        break;
      default:
        element = null;
    }
  }

  return (
    <>
      {element} <ConditionalIndicator item={item} />
    </>
  );
};
