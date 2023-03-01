import { useTemplateStore } from "@components/form-builder/store";
import { FormElementWithIndex, LocalizedElementProperties } from "@components/form-builder/types";
import React from "react";

export const QuestionDescription = ({
  item,
  itemIndex,
}: {
  item: FormElementWithIndex;
  itemIndex: number;
}) => {
  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const properties = item.properties;
  const description =
    properties[localizeField(LocalizedElementProperties.DESCRIPTION, translationLanguagePriority)];

  return (
    <>
      {description && (
        <div
          data-testid="description-text"
          className="description-text mt-5 cursor-not-allowed rounded-sm p-2 bg-gray-100 text-gray-600"
          id={`item${itemIndex}-describedby`}
        >
          {description}
        </div>
      )}
    </>
  );
};
