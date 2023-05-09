import React from "react";

import { PanelBody } from "./";
import { FormElementWithIndex, Language } from "../../types";

export const PanelBodySub = ({
  item,
  elIndex,
  onQuestionChange,
  onRequiredChange,
}: {
  item: FormElementWithIndex;
  elIndex: number;
  onQuestionChange: (elIndex: number, subIndex: number, val: string, lang: Language) => void;
  onRequiredChange: (subIndex: number, val: boolean) => void;
}) => {
  const onQuestionChangeSub = (subIndex: number, val: string, lang: Language) => {
    onQuestionChange(elIndex, subIndex, val, lang);
  };

  return (
    <div className="py-5">
      <PanelBody
        elIndex={elIndex}
        item={item}
        onQuestionChange={onQuestionChangeSub}
        onRequiredChange={onRequiredChange}
      />
    </div>
  );
};
