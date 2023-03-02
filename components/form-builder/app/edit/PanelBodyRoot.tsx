import React from "react";

import { PanelBody } from "./";
import { FormElementWithIndex, Language, LocalizedElementProperties } from "../../types";
import { useTemplateStore } from "../../store";
import { useUpdateElement } from "../../hooks";

export const PanelBodyRoot = ({ item }: { item: FormElementWithIndex }) => {
  const { updateElement } = useUpdateElement();
  const { localizeField, updateField, resetChoices, elements } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    elements: s.form.elements,
    updateField: s.updateField,
    unsetField: s.unsetField,
    resetChoices: s.resetChoices,
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

  const onRequiredChange = (itemIndex: number, checked: boolean) => {
    updateField(`form.elements[${itemIndex}].properties.validation.required`, checked);
  };

  const onElementChange = (type: string, itemIndex: number) => {
    const path = `form.elements[${itemIndex}]`;

    updateElement(type, path);
    if (type === "richText") {
      resetChoices(itemIndex);
    }
  };

  return (
    <PanelBody
      elements={elements}
      item={item}
      onElementChange={onElementChange}
      onQuestionChange={onQuestionChange}
      onRequiredChange={onRequiredChange}
    />
  );
};
