import { useTemplateStore } from "../store";
import { LocalizedElementProperties } from "../types";
import { useTranslation } from "next-i18next";
import { FormElementTypes } from "@lib/types";
import { isValidatedTextType, isAutoCompleteField } from "@components/form-builder/util";

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

  const setDefaultTitle = (type: string, path: string) => {
    const titleEn = localizeField(LocalizedElementProperties.TITLE, "en");
    const titleFr = localizeField(LocalizedElementProperties.TITLE, "fr");

    // update default description en
    updateField(
      `${path}.properties[${titleEn}]`,
      t(`addElementDialog.${type}.label`, { lng: "en" })
    );
    // update default description fr
    updateField(
      `${path}.properties[${titleFr}]`,
      t(`addElementDialog.${type}.label`, { lng: "fr" })
    );
  };

  const updateTextElement = (type: string, path: string) => {
    if (type === "text" || type === "textField") {
      unsetField(`${path}.properties.validation.type`);
      unsetField(`${path}.properties.autoComplete`);
      return true;
    }

    updateField(`${path}.type`, "textField");
    setDefaultDescription(type, path);

    if (!isValidatedTextType(type as FormElementTypes)) return false;

    if (isValidatedTextType(type as FormElementTypes)) {
      updateField(`${path}.properties.validation.type`, type);
      unsetField(`${path}.properties.autoComplete`);
      unsetField(`${path}.properties.validation.maxLength`);
      setDefaultTitle(type, path);
      return true;
    }

    if (isAutoCompleteField(type)) {
      updateField(`${path}.properties.autoComplete`, type);
      setDefaultDescription(type as FormElementTypes, path);
    }

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

  const addElement = (type: string, path: string) => {
    if (isValidatedTextType(type as FormElementTypes)) {
      updateField(`${path}.properties.validation.type`, type);
      setDefaultDescription(type as FormElementTypes, path);
      return;
    }

    if (isAutoCompleteField(type as string)) {
      updateField(`${path}.properties.autoComplete`, type);
      setDefaultTitle(type, path);
      setDefaultDescription(type as FormElementTypes, path);
    }
  };

  const isTextField = (type: string) => {
    return isValidatedTextType(type as FormElementTypes) || isAutoCompleteField(type);
  };

  return { isTextField, addElement, updateElement, updateTextElement, setDefaultDescription };
};
