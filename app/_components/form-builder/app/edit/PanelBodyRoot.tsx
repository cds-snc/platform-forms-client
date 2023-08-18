import React from "react";

import { PanelBody } from ".";
import { FormElementWithIndex, Language, LocalizedElementProperties } from "../../types";
import { useTemplateStore } from "../../store";

export const PanelBodyRoot = ({ item }: { item: FormElementWithIndex }) => {
  const { updateField, propertyPath } = useTemplateStore((s) => ({
    propertyPath: s.propertyPath,
    localizeField: s.localizeField,
    updateField: s.updateField,
  }));

  // all element state updaters should be setup at this level
  // we should be able to pass and `item` + `updaters`to build up each element panel
  // i.e. we should be able to pass a sub element item or a top level update
  // and make updates to the store accordingly
  // the `panel body` should be the ony thing that knows about the store
  // and the only thing that should be able to update the store

  const onQuestionChange = (itemId: number, val: string, lang: Language) => {
    updateField(propertyPath(itemId, LocalizedElementProperties.TITLE, lang), val);
  };

  const onRequiredChange = (itemId: number, checked: boolean) => {
    updateField(propertyPath(itemId, "validation.required"), checked);
  };

  return (
    <div className="mx-7 py-7">
      <PanelBody
        item={item}
        onQuestionChange={onQuestionChange}
        onRequiredChange={onRequiredChange}
      />
    </div>
  );
};
