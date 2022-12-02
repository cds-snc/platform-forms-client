import React, { useCallback } from "react";
import { FormElementTypes, HTMLTextInputTypeAttribute } from "@lib/types";
import { useTranslation } from "next-i18next";

import { CheckBoxEmptyIcon, RadioEmptyIcon } from "../../icons";
import { ShortAnswer, Options, RichText } from "./elements";
import { ElementOption, FormElementWithIndex } from "../../types";
import { useElementOptions } from "../../hooks";
import { useTemplateStore } from "../../store";

export const SelectedElement = ({
  selected,
  item,
}: {
  selected: ElementOption;
  item: FormElementWithIndex;
}) => {
  const { t } = useTranslation("form-builder");

  let element = null;

  switch (selected.id) {
    case "text":
    case "textField":
      element = <ShortAnswer>{t("shortAnswerText")}</ShortAnswer>;
      break;
    case "richText":
      element = <RichText parentIndex={item.index} />;
      break;
    case "textArea":
      element = <ShortAnswer>{t("longAnswerText")}</ShortAnswer>;
      break;
    case "radio":
      element = <Options item={item} renderIcon={() => <RadioEmptyIcon />} />;
      break;
    case "checkbox":
      element = <Options item={item} renderIcon={() => <CheckBoxEmptyIcon />} />;
      break;
    case "dropdown":
      element = <Options item={item} renderIcon={(index) => `${index + 1}.`} />;
      break;
    case "email":
      element = <ShortAnswer data-testid="email">{t("example@canada.gc.ca")}</ShortAnswer>;
      break;
    case "phone":
      element = <ShortAnswer data-testid="phone">555-555-0000</ShortAnswer>;
      break;
    case "date":
      element = <ShortAnswer data-testid="date">mm/dd/yyyy</ShortAnswer>;
      break;
    case "number":
      element = <ShortAnswer>0123456789</ShortAnswer>;
      break;
    default:
      element = null;
  }

  return element;
};

export const getSelectedOption = (item: FormElementWithIndex): ElementOption => {
  const elementOptions = useElementOptions();
  const { validationType, type } = useTemplateStore(
    useCallback(
      (s) => {
        return {
          type: s.form?.elements[item.index]?.type,
          validationType: s.form?.elements[item.index].properties?.validation?.type,
        };
      },
      [item.index]
    )
  );

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
  return selected && selected.length ? selected[0] : elementOptions[2];
};
