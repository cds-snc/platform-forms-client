import React from "react";

import { PanelBody } from "./";
import { FormElementWithIndex, Language } from "../../types";
import { FormElement } from "@lib/types";

export const PanelBodySub = ({
  item,
  elements,
  elIndex,
  onQuestionChange,
  onElementChange,
  onRequiredChange,
}: {
  item: FormElementWithIndex;
  elements: FormElement[];
  elIndex: number;
  onQuestionChange: (elIndex: number, subIndex: number, val: string, lang: Language) => void;
  onElementChange: (id: string, subIndex: number) => void;
  onRequiredChange: (subIndex: number, val: boolean) => void;
}) => {
  const onQuestionChangeSub = (subIndex: number, val: string, lang: Language) => {
    onQuestionChange(elIndex, subIndex, val, lang);
  };

  return (
    <div className="py-5">
      <PanelBody
        elements={elements}
        elIndex={elIndex}
        item={item}
        onElementChange={onElementChange}
        onQuestionChange={onQuestionChangeSub}
        onRequiredChange={onRequiredChange}
      />
    </div>
  );
};
