import React from "react";

import { PanelBody } from ".";
import { FormElementWithIndex, Language } from "../../types";

export const PanelBodySub = ({
  item,
  elIndex,
  onQuestionChange,
  onRequiredChange,
}: {
  item: FormElementWithIndex;
  elIndex: number;
  onQuestionChange: (itemId: number, val: string, lang: Language) => void;
  onRequiredChange: (subIndex: number, val: boolean) => void;
}) => {
  return (
    <div className="py-5">
      <PanelBody
        elIndex={elIndex}
        item={item}
        onQuestionChange={onQuestionChange}
        onRequiredChange={onRequiredChange}
      />
    </div>
  );
};
