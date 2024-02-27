"use client";
import React from "react";
import { FormElementTypes, HTMLTextInputTypeAttribute } from "@lib/types";
import { useTranslation } from "@i18n/client";

import { CheckBoxEmptyIcon, CheckIcon, RadioEmptyIcon } from "@serverComponents/icons";
import { ShortAnswer, Options, SubOptions, RichText, SubElement } from "./elements";
import { ElementOption, FormElementWithIndex } from "@lib/types/form-builder-types";
import { useElementOptions } from "@lib/hooks/form-builder";
import { ConditionalIndicator } from "@formBuilder/components/shared/conditionals/ConditionalIndicator";

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

  let selectedType: FormElementTypes | HTMLTextInputTypeAttribute = type;

  if (!type) {
    return elementOptions[1];
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
    selected && selected.length ? selected[0] : elementOptions[1],
    elementOptions
  );
};

export const SelectedElement = ({
  item,
  elIndex = -1,
}: {
  item: FormElementWithIndex;
  elIndex: number;
}) => {
  const { t } = useTranslation("form-builder");

  let element = null;

  const selected = useGetSelectedOption(item);

  switch (selected.id) {
    case "textField":
      element = <ShortAnswer>{t("shortAnswerText")}</ShortAnswer>;
      break;
    case "richText":
      element = <RichText id={item.id} elIndex={item.index} />;
      break;
    case "textArea":
      element = <ShortAnswer>{t("longAnswerText")}</ShortAnswer>;
      break;
    case "fileInput":
      element = <ShortAnswer>{t("addElementDialog.fileInput.title")}</ShortAnswer>;
      break;
    case "radio":
      if (elIndex !== -1) {
        element = (
          <SubOptions elIndex={elIndex} item={item} renderIcon={() => <RadioEmptyIcon />} />
        );
      } else {
        element = (
          <>
            <ShortAnswer>{t("addElementDialog.radio.title")}</ShortAnswer>
            <Options item={item} renderIcon={() => <RadioEmptyIcon />} />
          </>
        );
      }
      break;
    case "checkbox":
      if (elIndex !== -1) {
        element = (
          <SubOptions elIndex={elIndex} item={item} renderIcon={() => <CheckBoxEmptyIcon />} />
        );
      } else {
        element = (
          <>
            <ShortAnswer>
              <div className="flex items-center ">
                <CheckIcon />
                <span className="ml-2 text-lg">{t("addElementDialog.checkbox.title")}</span>
              </div>
            </ShortAnswer>
            <Options item={item} renderIcon={() => <CheckBoxEmptyIcon />} />
          </>
        );
      }
      break;
    case "dropdown":
      if (elIndex !== -1) {
        element = (
          <SubOptions elIndex={elIndex} item={item} renderIcon={(index) => `${index + 1}.`} />
        );
      } else {
        element = (
          <>
            <ShortAnswer>{t("addElementDialog.dropdown.title")}</ShortAnswer>
            {!item.properties.managedChoices && (
              <Options item={item} renderIcon={() => <CheckBoxEmptyIcon />} />
            )}
          </>
        );
      }
      break;
    case "combobox":
      if (elIndex !== -1) {
        element = (
          <SubOptions elIndex={elIndex} item={item} renderIcon={(index) => `${index + 1}.`} />
        );
      } else {
        element = (
          <>
            <ShortAnswer>{t("addElementDialog.combobox.title")}</ShortAnswer>
            {!item.properties.managedChoices && (
              <Options item={item} renderIcon={() => <CheckBoxEmptyIcon />} />
            )}
          </>
        );
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
      element = <ShortAnswer data-testid="number">0123456789</ShortAnswer>;
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

  return (
    <>
      {element} <ConditionalIndicator item={item} />
    </>
  );
};
