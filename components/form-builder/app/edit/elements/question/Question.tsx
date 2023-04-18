import React from "react";
import { FormElementWithIndex, LocalizedElementProperties, Language } from "@formbuilder/types";
import { useTemplateStore } from "@formbuilder/store";
import { QuestionInput, QuestionNumber } from "../";

export const Question = ({
  item,
  onQuestionChange,
  describedById,
}: {
  item: FormElementWithIndex;
  onQuestionChange: (itemIndex: number, val: string, lang: Language) => void;
  describedById?: string;
}) => {
  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const itemIndex = item.index;
  const isRichText = item.type === "richText";
  const properties = item.properties;
  const title =
    properties[localizeField(LocalizedElementProperties.TITLE, translationLanguagePriority)];

  return isRichText ? null : (
    <>
      <QuestionNumber index={itemIndex} questionNumber={item.questionNumber} />
      <QuestionInput
        initialValue={title}
        index={itemIndex}
        id={item.id}
        describedById={describedById}
        onQuestionChange={onQuestionChange}
      />
    </>
  );
};
