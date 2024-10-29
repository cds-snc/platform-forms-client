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

  return (
    <>
      {isRichText || isDynamicRow ? (
        <div className="my-4">
          <div className={cn(isDynamicRow && "px-4 mb-2 mt-8")}>
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

          <div className="mb-4 flex gap-4 text-sm ">
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
                <div className="disabled">
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
          <div>
            {isAddressComplete && (
              <div className="text-sm flex">
                <div className="w-1/2">
                  {!item.properties.addressComponents?.canadianOnly && (
                    <div className="description-text mt-5 cursor-not-allowed rounded-sm p-2 bg-gray-100 text-slate-600">
                      {t("addElementDialog.addressComplete.country")}
                    </div>
                  )}
                  <div className="description-text mt-5 cursor-not-allowed rounded-sm p-2 bg-gray-100 text-slate-600">
                    {t("addElementDialog.addressComplete.street.label")}
                  </div>
                  <div className="description-text mt-5 cursor-not-allowed rounded-sm p-2 bg-gray-100 text-slate-600">
                    {t("addElementDialog.addressComplete.city")}
                  </div>
                  <div className="description-text mt-5 cursor-not-allowed rounded-sm p-2 bg-gray-100 text-slate-600">
                    {t("addElementDialog.addressComplete.province")}
                  </div>
                  <div className="description-text mt-5 cursor-not-allowed rounded-sm p-2 bg-gray-100 text-slate-600">
                    {t("addElementDialog.addressComplete.postal")}
                  </div>
                </div>
                <div className="mb-4 mt-4 ml-4 self-end w-1/2">
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
        </>
      )}
    </>
  );
};
