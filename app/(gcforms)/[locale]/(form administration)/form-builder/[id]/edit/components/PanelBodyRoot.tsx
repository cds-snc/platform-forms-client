"use client";
import React from "react";

import { PanelBody } from ".";
import {
  FormElementWithIndex,
  Language,
  LocalizedElementProperties,
} from "@lib/types/form-builder-types";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { cn } from "@lib/utils";

export const PanelBodyRoot = ({
  item,
  onChangeMade,
  formId,
}: {
  item: FormElementWithIndex;
  onChangeMade: () => void;
  formId: string;
}) => {
  const { updateField, propertyPath } = useTemplateStore((s) => ({
    propertyPath: s.propertyPath,
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
    onChangeMade();
  };

  const isRepeatingSet = item.type === "dynamicRow";

  return (
    <div className={cn(!isRepeatingSet && "mx-7 py-12")}>
      <PanelBody
        item={item}
        onQuestionChange={onQuestionChange}
        onRequiredChange={onRequiredChange}
        formId={formId}
      />
    </div>
  );
};
