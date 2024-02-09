"use client";
import React from "react";
import { useTranslation } from "@i18n/client";

import { FormElementWithIndex, Language, LocalizedElementProperties } from "../../types";
import { SelectedElement, ElementRequired } from ".";
import { Question } from "./elements";
import { QuestionDescription } from "./elements/question/QuestionDescription";
import { useTemplateStore } from "@clientComponents/form-builder/store";
import { Tooltip } from "../shared/Tooltip";
import { Trans } from "react-i18next";

export const PanelBody = ({
  item,
  elIndex = -1,
  onQuestionChange,
  onRequiredChange,
}: {
  item: FormElementWithIndex;
  elIndex?: number;
  onQuestionChange: (itemId: number, val: string, lang: Language) => void;
  onRequiredChange: (itemId: number, checked: boolean) => void;
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
        <div className="my-4">
          <Question item={item} onQuestionChange={onQuestionChange} />
          <SelectedElement item={item} elIndex={elIndex} />
        </div>
      ) : (
        <>
          <div className="flex text-sm">
            <div className="mt-4 w-full laptop:mt-0">
              <Question
                item={item}
                onQuestionChange={onQuestionChange}
                describedById={describedById}
              />
            </div>
          </div>
          <div className="mb-4 flex gap-4 text-sm">
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
              {item.properties.managedChoices && (
                <div data-testid={`managedChoices-${item.id}`} className="mt-5 flex text-sm">
                  <strong>{t("managedList.prefix")}</strong>{" "}
                  <a
                    href="https://github.com/cds-snc/gc-organisations"
                    className="ml-2"
                    target="_blank"
                  >
                    {t(`managedList.${item.properties.managedChoices}`)}
                  </a>
                  <Tooltip.Info side="top" triggerClassName="align-baseline ml-1">
                    <strong>{t("tooltips.departmentElement.title")}</strong>
                    <Trans
                      ns="form-builder"
                      i18nKey="tooltips.departmentElement.body"
                      defaults="<italic></italic> <a></a> <p></p>"
                      components={{ italic: <i />, a: <a />, p: <p /> }}
                    />
                  </Tooltip.Info>
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
