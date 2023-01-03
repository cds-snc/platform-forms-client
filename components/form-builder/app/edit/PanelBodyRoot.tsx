import React from "react";
import { useTranslation } from "next-i18next";

import { PanelBody } from "./";
import { FormElementWithIndex, Language, LocalizedElementProperties } from "../../types";
import { useTemplateStore } from "../../store";

export const PanelBodyRoot = ({ item }: { item: FormElementWithIndex }) => {
  const { t } = useTranslation("form-builder");
  const { localizeField, updateField, unsetField, resetChoices, translationLanguagePriority } =
    useTemplateStore((s) => ({
      localizeField: s.localizeField,
      elements: s.form.elements,
      updateField: s.updateField,
      unsetField: s.unsetField,
      resetChoices: s.resetChoices,
      translationLanguagePriority: s.translationLanguagePriority,
    }));

  // all element state updaters should be setup at this level
  // we should be able to pass and `item` + `updaters`to build up each element panel
  // i.e. we should be able to pass a sub element item or a top level update
  // and make updates to the store accordingly
  // the `panel body` should be the ony thing that knows about the store
  // and the only thing that should be able to update the store

  const onQuestionChange = (itemIndex: number, val: string, lang: Language) => {
    updateField(
      `form.elements[${itemIndex}].properties.${localizeField(
        LocalizedElementProperties.TITLE,
        lang
      )}`,
      val
    );
  };

  const onElementChange = (id: string, itemIndex: number) => {
    switch (id) {
      case "text":
      case "textField":
      case "email":
      case "phone":
      case "date":
      case "number":
        updateField(`form.elements[${itemIndex}].type`, "textField");
        if (id === "textField" || id === "text") {
          unsetField(`form.elements[${itemIndex}].properties.validation.type`);
        } else {
          updateField(`form.elements[${itemIndex}].properties.validation.type`, id);
          unsetField(`form.elements[${itemIndex}].properties.validation.maxLength`);
        }
        break;
      case "richText":
        resetChoices(itemIndex);
      // no break here (we want default to happen)
      default: // eslint-disable-line no-fallthrough
        updateField(`form.elements[${itemIndex}].type`, id);
        unsetField(`form.elements[${itemIndex}].properties.validation.type`);
        unsetField(`form.elements[${itemIndex}].properties.validation.maxLength`);
        break;
    }

    _setDefaultDescription(id, itemIndex);
  };

  const _setDefaultDescription = (id: string, itemIndex: number) => {
    switch (id) {
      case "email":
      case "phone":
      case "date":
      case "number":
        updateField(
          `form.elements[${itemIndex}].properties.${
            (localizeField(LocalizedElementProperties.DESCRIPTION), translationLanguagePriority)
          }`,
          t(`defaultElementDescription.${id}`)
        );
        break;
      default:
        break;
    }
  };

  return (
    <PanelBody item={item} onElementChange={onElementChange} onQuestionChange={onQuestionChange} />
  );
};
