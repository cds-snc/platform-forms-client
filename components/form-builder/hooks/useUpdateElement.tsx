import { useTemplateStore } from "../store";
import { LocalizedElementProperties } from "../types";
import { useTranslation } from "next-i18next";
import { FormElementTypes, ElementProperties } from "@lib/types";
import { isValidatedTextType, isAutoCompleteField } from "@components/form-builder/util";

export const useUpdateElement = () => {
  const { t } = useTranslation("form-builder");
  const { localizeField, updateField, unsetField, getPropertiesByPath } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    updateField: s.updateField,
    unsetField: s.unsetField,
    getPropertiesByPath: s.getPropertiesByPath,
  }));

  const setDefaultDescription = (type: string, path: string) => {
    const descriptionEn = localizeField(LocalizedElementProperties.DESCRIPTION, "en");
    const descriptionFr = localizeField(LocalizedElementProperties.DESCRIPTION, "fr");

    // update default description en
    updateField(
      `${path}.properties[${descriptionEn}]`,
      t([`defaultElementDescription.${type}`, ""], { lng: "en" })
    );
    // update default description fr
    updateField(
      `${path}.properties[${descriptionFr}]`,
      t([`defaultElementDescription.${type}`, ""], { lng: "fr" })
    );
  };

  const setDefaultTitle = (type: string, path: string) => {
    const titleEn = localizeField(LocalizedElementProperties.TITLE, "en");
    const titleFr = localizeField(LocalizedElementProperties.TITLE, "fr");

    // update default title en
    updateField(
      `${path}.properties[${titleEn}]`,
      t([`addElementDialog.${type}.label`, ""], { lng: "en" })
    );
    // update default title fr
    updateField(
      `${path}.properties[${titleFr}]`,
      t([`addElementDialog.${type}.label`, ""], { lng: "fr" })
    );
  };

  const getTextElementProperties = (type: string) => {
    const obj: { type?: string; autoComplete?: string; validation: { type?: string } } = {
      validation: {},
    };

    if (type === "textArea" || type === "textField") {
      obj.type = type;
      return obj;
    }

    obj.type = "textField";

    if (isValidatedTextType(type as FormElementTypes) && isAutoCompleteField(type)) {
      obj.validation.type = type;
      obj.autoComplete = type;
      return obj;
    }

    if (isAutoCompleteField(type)) {
      obj.autoComplete = type;
      return obj;
    }

    if (isValidatedTextType(type as FormElementTypes)) {
      obj.validation.type = type;
      return obj;
    }
  };

  const updateTextElement = (type: string, path: string) => {
    if (type === "textArea" || type === "textField") {
      unsetField(`${path}.properties.validation.type`);
      unsetField(`${path}.properties.autoComplete`);
      updateField(`${path}.type`, type);
      return;
    }

    updateField(`${path}.type`, "textField");

    if (isValidatedTextType(type as FormElementTypes) && isAutoCompleteField(type)) {
      updateField(`${path}.properties.validation.type`, type);
      updateField(`${path}.properties.autoComplete`, type);
      return;
    }

    if (isAutoCompleteField(type)) {
      unsetField(`${path}.properties.validation.type`);
      updateField(`${path}.properties.autoComplete`, type);
      return;
    }

    if (isValidatedTextType(type as FormElementTypes)) {
      updateField(`${path}.properties.validation.type`, type);
      unsetField(`${path}.properties.autoComplete`);
      return;
    }
  };

  const getDefaultDescription = (type: string) => {
    return {
      descriptionEn: t([`defaultElementDescription.${type}`, ""], { lng: "en" }),
      descriptionFr: t([`defaultElementDescription.${type}`, ""], { lng: "fr" }),
    };
  };

  const getDefaultTitle = (type: string) => {
    return {
      titleEn: t([`addElementDialog.${type}.label`, ""], { lng: "en" }),
      titleFr: t([`addElementDialog.${type}.label`, ""], { lng: "fr" }),
    };
  };

  const getPropertyObject = (type: string, path: string) => {
    try {
      const {
        validation,
        // eslint-disable-next-line  @typescript-eslint/no-unused-vars
        autoComplete,
        ...rest
      } = getPropertiesByPath(`${path}.properties`) as ElementProperties;

      const titles = getDefaultTitle(type);
      const descriptions = getDefaultDescription(type);
      const textProps = getTextElementProperties(type);
      const textValidation = textProps?.validation ?? {};
      const textAutoComplete = textProps?.autoComplete
        ? { autoComplete: textProps?.autoComplete }
        : { type: "" };
      const textType = textProps?.type ? { type: textProps?.type } : {};

      const attestation: { all?: boolean } = {};

      if (type === FormElementTypes.attestation) {
        attestation.all = true;
      }

      const validationObj = { required: validation?.required, ...textValidation, ...attestation };

      const properties = {
        ...rest,
        ...titles,
        ...descriptions,
        ...textType,
        validation: { ...validationObj },
        ...textAutoComplete,
      };

      return properties;
    } catch (e) {
      // console.log(e);
    }
  };

  const updateElement = (type: string, path: string) => {
    // const properties = getPropertyObject(type, path);
    unsetField(`${path}.properties.validation.all`);
    setDefaultDescription(type, path);
    setDefaultTitle(type, path);

    if (isTextField(type as FormElementTypes)) {
      return updateTextElement(type, path);
    }

    if (type === FormElementTypes.attestation) {
      // Need to swap type because incoming `attestation` is a checkbox type
      type = FormElementTypes.checkbox;
      updateField(`${path}.properties.validation.all`, true);
      unsetField(`${path}.properties.validation.type`);
      unsetField(`${path}.properties.autoComplete`);
    }

    if (!isTextField(type as FormElementTypes)) {
      unsetField(`${path}.properties.validation.maxLength`);
    }

    updateField(`${path}.type`, type);
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
    return (
      ["textArea", "textField"].includes(type) ||
      isValidatedTextType(type as FormElementTypes) ||
      isAutoCompleteField(type as string)
    );
  };

  return { isTextField, addElement, updateElement, updateTextElement, setDefaultDescription };
};
