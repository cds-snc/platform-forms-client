import React from "react";
import { FormElementTypes, HTMLTextInputTypeAttribute } from "@lib/types";
import { useTranslation } from "next-i18next";

import { CheckBoxEmptyIcon, RadioEmptyIcon } from "../../icons";
import { ShortAnswer, Options, SubOptions, RichText, SubElement } from "./elements";
import { ElementOption, FormElementWithIndex } from "../../types";
import { useElementOptions } from "../../hooks";

export const SelectedElement = ({
  selected,
  item,
  elIndex = -1,
}: {
  selected: ElementOption;
  item: FormElementWithIndex;
  elIndex: number;
}) => {
  const { t } = useTranslation("form-builder");

  let element = null;

  switch (selected.id) {
    case "textField":
      element = <ShortAnswer>{t("shortAnswerText")}</ShortAnswer>;
      break;
    case "richText":
      if (elIndex !== -1) {
        element = <RichText elIndex={elIndex} subIndex={item.index} />;
      } else {
        element = <RichText elIndex={item.index} />;
      }
      break;
    case "textArea":
      element = <ShortAnswer>{t("longAnswerText")}</ShortAnswer>;
      break;
    case "radio":
      if (elIndex !== -1) {
        element = (
          <SubOptions elIndex={elIndex} item={item} renderIcon={() => <RadioEmptyIcon />} />
        );
      } else {
        element = <Options item={item} renderIcon={() => <RadioEmptyIcon />} />;
      }
      break;
    case "checkbox":
      if (elIndex !== -1) {
        element = (
          <SubOptions elIndex={elIndex} item={item} renderIcon={() => <CheckBoxEmptyIcon />} />
        );
      } else {
        element = <Options item={item} renderIcon={() => <CheckBoxEmptyIcon />} />;
      }
      break;
    case "dropdown":
      if (elIndex !== -1) {
        element = (
          <SubOptions elIndex={elIndex} item={item} renderIcon={(index) => `${index + 1}.`} />
        );
      } else {
        element = <Options item={item} renderIcon={() => <CheckBoxEmptyIcon />} />;
      }
      break;
    case "email":
      element = <ShortAnswer data-testid="email">name@example.com</ShortAnswer>;
      break;
    case "phone":
      element = <ShortAnswer data-testid="phone">111-222-3333</ShortAnswer>;
      break;
    case "date":
      element = <ShortAnswer data-testid="date">mm/dd/yyyy</ShortAnswer>;
      break;
    case "number":
      element = <ShortAnswer>0123456789</ShortAnswer>;
      break;
    case "dynamicRow":
      element = <SubElement item={item} elIndex={item.index} />;
      break;
    case "attestation":
      element = <Options item={item} renderIcon={() => <CheckBoxEmptyIcon />} />;
      break;
    default:
      element = null;
  }

  return element;
};

export const filterSelected = (
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

export const useGetSelectedOption = (item: FormElementWithIndex): ElementOption => {
  const elementOptions = useElementOptions();

  const validationType = item.properties?.validation?.type;
  const type = item.type;

  let selectedType: FormElementTypes | HTMLTextInputTypeAttribute = type;

  if (!type) {
    return elementOptions[2];
  } else if (type === "textField") {
    /**
     * Email, phone, and date fields are specialized text field types.
     * That is to say, their "type" is "textField" but they have specalized validation "type"s.
     * So if we have a "textField", we want to first check properties.validation.type to see if
     * it is a true Short Answer, or one of the other types.
     * The one exception to this is validationType === "text" types, for which we want to return "textField"
     */
    selectedType = validationType && validationType !== "text" ? validationType : type;
  }

  const selected = elementOptions.filter((item) => item.id === selectedType);

  return filterSelected(
    item,
    selected && selected.length ? selected[0] : elementOptions[2],
    elementOptions
  );
};
