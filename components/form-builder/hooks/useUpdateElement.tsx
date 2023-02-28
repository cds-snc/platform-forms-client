import { useTemplateStore } from "../store";
import { LocalizedElementProperties } from "../types";
import { useTranslation } from "next-i18next";
import { FormElementTypes } from "@lib/types";
import { isValidatedTextType } from "@components/form-builder/util";

export const useUpdateElement = () => {
  const { t } = useTranslation("form-builder");
  const { localizeField, updateField, unsetField } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    updateField: s.updateField,
    unsetField: s.unsetField,
  }));

  const setDefaultDescription = (type: string, path: string) => {
    const descriptionEn = localizeField(LocalizedElementProperties.DESCRIPTION, "en");
    const descriptionFr = localizeField(LocalizedElementProperties.DESCRIPTION, "fr");

    // update default description en
    updateField(
      `${path}.properties[${descriptionEn}]`,
      t(`defaultElementDescription.${type}`, { lng: "en" })
    );
    // update default description fr
    updateField(
      `${path}.properties[${descriptionFr}]`,
      t(`defaultElementDescription.${type}`, { lng: "fr" })
    );
  };

  const updateTextElement = (type: string, path: string) => {
    if (type === "text" || type === "textField") {
      unsetField(`${path}.properties.validation.type`);
      return true;
    }

    if (!isValidatedTextType(type as FormElementTypes)) return false;

    updateField(`${path}.type`, "textField");
    updateField(`${path}.properties.validation.type`, type);
    unsetField(`${path}.properties.validation.maxLength`);
    setDefaultDescription(type, path);

    return true;
  };

  const updateElement = (type: string, path: string) => {
    if (type === FormElementTypes.attestation) {
      type = FormElementTypes.checkbox;
      updateField(`${path}.properties.validation.all`, true);
    } else {
      unsetField(`${path}.properties.validation.all`);
    }

    updateField(`${path}.type`, type);
    unsetField(`${path}.properties.validation.type`);
    unsetField(`${path}.properties.validation.maxLength`);
  };

  return { updateElement, updateTextElement, setDefaultDescription };
};
