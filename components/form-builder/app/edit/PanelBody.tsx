import React from "react";
import { useTranslation } from "next-i18next";

import { FormElementWithIndex, Language, LocalizedElementProperties } from "../../types";
import { SelectedElement, ElementRequired } from ".";
import { Question } from "./elements";
import { FormElement } from "@lib/types";
import { QuestionDescription } from "./elements/question/QuestionDescription";
import { useTemplateStore } from "@components/form-builder/store";

export const PanelBody = ({
  item,
  elIndex = -1,
  elements,
  onQuestionChange,
  onRequiredChange,
}: {
  item: FormElementWithIndex;
  elIndex?: number;
  elements: FormElement[];
  onQuestionChange: (itemIndex: number, val: string, lang: Language) => void;
  onRequiredChange: (itemIndex: number, checked: boolean) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const isRichText = item.type === "richText";
  const isDynamicRow = item.type === "dynamicRow";
  const properties = item.properties;
  const maxLength = properties?.validation?.maxLength;

  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const description =
    properties[localizeField(LocalizedElementProperties.DESCRIPTION, translationLanguagePriority)];

  const describedById = description ? `item${item.id}-describedby` : undefined;

  return (
    <>
      {isRichText || isDynamicRow ? (
        <>
          <Question
            elements={elements}
            elIndex={elIndex}
            item={item}
            onQuestionChange={onQuestionChange}
          />
          <SelectedElement item={item} elIndex={elIndex} />
        </>
      ) : (
        <>
          <div className="flex text-sm flex-col laptop:flex-row-reverse laptop:justify-between laptop:gap-x-4">
            <div className="w-full mt-4 laptop:mt-0 laptop:w-3/5">
              <Question
                elements={elements}
                elIndex={elIndex}
                item={item}
                onQuestionChange={onQuestionChange}
                describedById={describedById}
              />
            </div>
          </div>
          <div className="flex text-sm flex-col laptop:flex-row laptop:gap-x-4 laptop:justify-between">
            <div className="w-full laptop:w-3/5">
              <QuestionDescription item={item} describedById={describedById} />
              <SelectedElement item={item} elIndex={elIndex} />
              {maxLength && (
                <div className="disabled">
                  {t("maxCharacterLength")}
                  {maxLength}
                </div>
              )}
            </div>
            <div className="w-full laptop:w-2/5">
              <ElementRequired onRequiredChange={onRequiredChange} item={item} />
              {item.properties.autoComplete && (
                <div data-testid={`autocomplete-${item.id}`} className="mt-5">
                  <strong>{t("autocompleteIsSetTo")}</strong>{" "}
                  {t(`autocompleteOptions.${item.properties.autoComplete}`)}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
