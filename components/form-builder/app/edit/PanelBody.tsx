import React from "react";
import { useTranslation } from "next-i18next";

import { FormElementWithIndex, Language, LocalizedElementProperties } from "../../types";
import { SelectedElement, ElementRequired } from ".";
import { Question } from "./elements";
import { QuestionDescription } from "./elements/question/QuestionDescription";
import { useTemplateStore } from "@components/form-builder/store";

export const PanelBody = ({
  item,
  elIndex = -1,
  onQuestionChange,
  onRequiredChange,
}: {
  item: FormElementWithIndex;
  elIndex?: number;
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
        <div className="mt-4 mb-4">
          <Question item={item} onQuestionChange={onQuestionChange} />
          <SelectedElement item={item} elIndex={elIndex} />
        </div>
      ) : (
        <>
          <div className="flex text-sm">
            <div className="w-full mt-4 laptop:mt-0">
              <Question
                item={item}
                onQuestionChange={onQuestionChange}
                describedById={describedById}
              />
            </div>
          </div>
          <div className="flex gap-4 mb-4 text-sm">
            <div className="w-1/2">
              <QuestionDescription item={item} describedById={describedById} />
              <SelectedElement item={item} elIndex={elIndex} />
              {maxLength && (
                <div className="disabled">
                  {t("maxCharacterLength")}
                  {maxLength}
                </div>
              )}
            </div>
            <div className="w-1/2">
              {item.properties.autoComplete && (
                <div data-testid={`autocomplete-${item.id}`} className="mt-5 text-sm">
                  <strong>{t("autocompleteIsSetTo")}</strong>{" "}
                  {t(`autocompleteOptions.${item.properties.autoComplete}`)}
                </div>
              )}
              <ElementRequired onRequiredChange={onRequiredChange} item={item} />
            </div>
          </div>
        </>
      )}
    </>
  );
};
