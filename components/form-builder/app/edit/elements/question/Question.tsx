import React from "react";
import { FormElementWithIndex, LocalizedElementProperties, Language } from "@formbuilder/types";
import { useTemplateStore } from "@formbuilder/store";
import { QuestionInput, QuestionNumber } from "../";

export const Question = ({
  item,
  onQuestionChange,
}: {
  item: FormElementWithIndex;
  onQuestionChange: (itemIndex: number, val: string, lang: Language) => void;
}) => {
  const { elements, localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    elements: s.form.elements,
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
      <QuestionNumber item={item} elements={elements} />

      <QuestionInput
        initialValue={title}
        index={itemIndex}
        hasDescription={description}
        onQuestionChange={onQuestionChange}
      />

      {description && !isRichText && (
        <div
          className="mt-5 cursor-not-allowed rounded-sm p-2 bg-gray-100 text-gray-600"
          id={`item${itemIndex}-describedby`}
        >
          {description}
        </div>
      )}
    </>
  );
};
