import React from "react";
import { FormElementWithIndex, LocalizedElementProperties, Language } from "@formbuilder/types";
import { useTemplateStore } from "@formbuilder/store";
import { QuestionInput, QuestionNumber } from "../";
import { FormElement } from "@lib/types";

export const Question = ({
  item,
  elements,
  elIndex,
  onQuestionChange,
  questionInputRef,
}: {
  item: FormElementWithIndex;
  elements: FormElement[];
  elIndex?: number;
  onQuestionChange: (itemIndex: number, val: string, lang: Language) => void;
  questionInputRef: React.RefObject<HTMLInputElement>;
}) => {
  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const itemIndex = item.index;
  const isRichText = item.type === "richText";
  const properties = item.properties;
  const description =
    properties[localizeField(LocalizedElementProperties.DESCRIPTION, translationLanguagePriority)];
  const title =
    properties[localizeField(LocalizedElementProperties.TITLE, translationLanguagePriority)];

  return isRichText ? null : (
    <>
      <QuestionNumber elIndex={elIndex} item={item} elements={elements} />

      <QuestionInput
        questionInputRef={questionInputRef}
        initialValue={title}
        index={itemIndex}
        hasDescription={description}
        onQuestionChange={onQuestionChange}
      />
    </>
  );
};
