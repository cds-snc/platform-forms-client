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
import { Trans } from "react-i18next";
import { Tooltip } from "@formBuilder/components/shared/Tooltip";
import { Button } from "@clientComponents/globals";
import { cn } from "@lib/utils";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { BetaBadge } from "@clientComponents/globals/BetaBadge";
import { FileInputTrialDescription } from "@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/FileInput";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";

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
  const isFormattedDate = item.type === "formattedDate";
  const isFileUpload = item.type === "fileInput";

  const { hasApiKeyId } = useFormBuilderConfig();

  const properties = item.properties;
  const maxLength = properties?.validation?.maxLength;

  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const { Event } = useCustomEvent();

  const description =
    properties[localizeField(LocalizedElementProperties.DESCRIPTION, translationLanguagePriority)];

  const describedById = description ? `item${item.id}-describedby` : undefined;

  const isInvalid = isFileUpload && !hasApiKeyId;

  return (
    <>
      {isRichText || isDynamicRow ? (
        <div className="my-4">
          <div className={cn(isDynamicRow && "px-4 mb-2 mt-8")}>
            <Question item={item} onQuestionChange={onQuestionChange} isInvalid={isInvalid} />
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
            <div className="mt-4 w-full laptop:mt-0">
              <Question
                item={item}
                onQuestionChange={onQuestionChange}
                describedById={describedById}
                isInvalid={isInvalid}
              />
            </div>
          </div>

          <div className="mb-4 flex gap-4 text-sm">
            <div className="grow">
              <QuestionDescription item={item} describedById={describedById} />
              <div className="flex">
                <div>
                  <SelectedElement item={item} elIndex={elIndex} formId={formId} />
                </div>
                {isFormattedDate && (
                  <div className="mb-4 ml-4 self-end">
                    <Button
                      theme="secondary"
                      onClick={() => {
                        Event.fire(EventKeys.openMoreDialog, { itemId: item.id });
                      }}
                    >
                      <>{t("addElementDialog.formattedDate.customizeDate")}</>
                    </Button>
                  </div>
                )}
              </div>

              {maxLength && (
                <div className="disabled pointer-events-none">
                  {t("maxCharacterLength")}
                  {maxLength}
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
                      defaults="<a></a> <p></p>"
                      components={{ a: <a />, p: <p /> }}
                    />
                  </Tooltip.Info>
                </div>
              )}

              {!isAddressComplete && (
                <ElementRequired
                  onRequiredChange={onRequiredChange}
                  item={item}
                  key={"element-required-" + item.id}
                />
              )}
            </div>
          </div>

          {isFileUpload && (
            <div className="mt-4 border-t border-dotted border-slate-800 pt-4">
              <BetaBadge className="inline-block" />
              {!hasApiKeyId && (
                <strong className="ml-2 inline-block text-sm font-bold text-red-700">
                  {t("fileUploadApiWarning.text")}
                </strong>
              )}
              <div className="mt-4 text-sm">
                <FileInputTrialDescription />
              </div>
            </div>
          )}

          <div>
            {isAddressComplete && (
              <div className="flex text-sm">
                <div className="w-1/2">
                  {!item.properties.addressComponents?.canadianOnly && (
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
                    {item.properties.addressComponents?.canadianOnly &&
                      t("addElementDialog.addressComplete.components.province")}
                    {!item.properties.addressComponents?.canadianOnly &&
                      t("addElementDialog.addressComplete.components.provinceOrState")}
                  </div>
                  <div className="mt-5 cursor-not-allowed rounded-sm bg-gray-100 p-2 text-slate-600">
                    {item.properties.addressComponents?.canadianOnly &&
                      t("addElementDialog.addressComplete.components.postalCode")}
                    {!item.properties.addressComponents?.canadianOnly &&
                      t("addElementDialog.addressComplete.components.postalCodeOrZip")}
                  </div>
                </div>
                <div className="my-4 ml-4 w-1/2 self-end">
                  <ElementRequired
                    onRequiredChange={onRequiredChange}
                    item={item}
                    key={"element-required-" + item.id}
                  />
                  <Button
                    theme="secondary"
                    onClick={() => {
                      Event.fire(EventKeys.openMoreDialog, { itemId: item.id });
                    }}
                  >
                    {t("addElementDialog.addressComplete.customize")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
