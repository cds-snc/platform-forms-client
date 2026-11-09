"use client";
import React from "react";
import { useTranslation } from "@i18n/client";

import {
  FormElementWithIndex,
  Language,
  LocalizedElementProperties,
} from "@lib/types/form-builder-types";
import { SelectedElement, ElementRequired } from ".";
import { Question } from "./elements";
import { QuestionDescription } from "./elements/question/QuestionDescription";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { cn } from "@lib/utils";
import { ManagedDataDetails } from "./ManagedDataDetails";

export const PanelBody = ({
  item,
  elIndex = -1,
  onQuestionChange,
  onRequiredChange,
  formId,
}: {
  item: FormElementWithIndex;
  elIndex?: number;
  onQuestionChange: (itemId: number, val: string, lang: Language) => void;
  onRequiredChange: (itemId: number, checked: boolean) => void;
  formId: string;
}) => {
  const { t } = useTranslation("form-builder");
  const isRichText = item.type === "richText";
  const isDynamicRow = item.type === "dynamicRow";

  const isAddressComplete = item.type === "addressComplete";
  const hasCustomRegex =
    item.properties.validation?.type === "custom" && item.properties.validation.regex;

  const properties = item.properties;
  const maxLength = properties?.validation?.maxLength;

  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const description =
    properties[localizeField(LocalizedElementProperties.DESCRIPTION, translationLanguagePriority)];

  const describedById = description ? `item${item.id}-describedby` : undefined;
  const isCanadianOnly = item.properties.addressComponents?.canadianOnly ?? true;

  return (
    <>
      {isRichText || isDynamicRow ? (
        <div className="my-4">
          <div className={cn(isDynamicRow && "mt-8 mb-2 px-4")}>
            <Question item={item} onQuestionChange={onQuestionChange} />
          </div>

          <div className={cn(isDynamicRow && "mb-2")}>
            <SelectedElement
              key={`item-${item.id}-${translationLanguagePriority}`}
              item={item}
              elIndex={elIndex}
              formId={formId}
            />
          </div>
        </div>
      ) : (
        <div data-id={item.id}>
          <div className="flex text-sm">
            <div className="laptop:mt-0 mt-4 w-full">
              <Question
                item={item}
                onQuestionChange={onQuestionChange}
                describedById={describedById}
              />
            </div>
          </div>

          <div className="mb-4 flex gap-8 text-sm">
            <div className="grow">
              <QuestionDescription item={item} describedById={describedById} />
              <>
                <div>
                  <SelectedElement item={item} elIndex={elIndex} formId={formId} />
                </div>
              </>

              {maxLength && (
                <div className="disabled pointer-events-none">
                  {t("maxCharacterLength")}
                  {maxLength}
                </div>
              )}
              {hasCustomRegex && (
                <div className="text-sm text-slate-500">{t("moreDialog.customRegex.label")}</div>
              )}

              {isAddressComplete && (
                <div>
                  <div>
                    {!isCanadianOnly && (
                      <div className="mt-5 cursor-not-allowed rounded-sm bg-gray-100 p-2 text-slate-600">
                        {t("addElementDialog.addressComplete.country")}
                      </div>
                    )}
                    <div className="mt-5 cursor-not-allowed rounded-sm bg-gray-100 p-2 text-slate-600">
                      {t("addElementDialog.addressComplete.street.label")}
                    </div>
                    <div className="mt-5 cursor-not-allowed rounded-sm bg-gray-100 p-2 text-slate-600">
                      {t("addElementDialog.addressComplete.city")}
                    </div>
                    <div className="mt-5 cursor-not-allowed rounded-sm bg-gray-100 p-2 text-slate-600">
                      {isCanadianOnly && t("addElementDialog.addressComplete.components.province")}
                      {!isCanadianOnly &&
                        t("addElementDialog.addressComplete.components.provinceOrState")}
                    </div>
                    <div className="mt-5 cursor-not-allowed rounded-sm bg-gray-100 p-2 text-slate-600">
                      {isCanadianOnly &&
                        t("addElementDialog.addressComplete.components.postalCode")}
                      {!isCanadianOnly &&
                        t("addElementDialog.addressComplete.components.postalCodeOrZip")}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="w-64">
              {item.properties.autoComplete && (
                <div data-testid={`autocomplete-${item.id}`} className="mt-5 text-sm">
                  <strong>{t("autocompleteIsSetTo")}</strong>{" "}
                  {t(`autocompleteOptions.${item.properties.autoComplete}`)}
                </div>
              )}
              {item.properties.managedChoices && <ManagedDataDetails item={item} />}
              <ElementRequired
                onRequiredChange={onRequiredChange}
                item={item}
                key={"element-required-" + item.id}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
