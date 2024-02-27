"use client";
import React from "react";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Language, LocalizedElementProperties } from "@clientComponents/form-builder/types";
import { useTranslation } from "@i18n/client";
import { FormElement } from "@lib/types";
import { LanguageLabel } from "./LanguageLabel";
import { FieldsetLegend } from ".";

export const Title = ({
  element,
  primaryLanguage,
}: {
  element: FormElement;
  primaryLanguage: Language;
}) => {
  const { updateField, localizeField, propertyPath } = useTemplateStore((s) => ({
    updateField: s.updateField,
    localizeField: s.localizeField,
    propertyPath: s.propertyPath,
  }));
  const { t } = useTranslation("form-builder");
  const secondaryLanguage = primaryLanguage === "en" ? "fr" : "en";
  const field = LocalizedElementProperties.TITLE;

  return (
    <>
      <fieldset>
        <FieldsetLegend>
          {t(`addElementDialog.${element.type}.title`)}: {t("questionTitle")}
        </FieldsetLegend>
        <div className="mb-10 flex gap-px divide-x-2 border-y border-r border-gray-300">
          <label className="sr-only" htmlFor={`element-${element.id}-title-${primaryLanguage}`}>
            {primaryLanguage}
          </label>
          <div className="relative w-1/2 flex-1">
            <LanguageLabel
              lang={primaryLanguage}
              id={`element-${element.id}-title-${primaryLanguage}-language`}
            >
              <>{primaryLanguage}</>
            </LanguageLabel>
            <textarea
              className="h-full w-full p-4 focus:outline-blue-focus"
              id={`element-${element.id}-title-${primaryLanguage}`}
              aria-describedby={`element-${element.id}-title-${primaryLanguage}-language`}
              value={element.properties[localizeField(field, primaryLanguage)]}
              onChange={(e) => {
                updateField(propertyPath(element.id, field, primaryLanguage), e.target.value);
              }}
            />
          </div>
          <label className="sr-only" htmlFor={`element-${element.id}-title-${secondaryLanguage}`}>
            {secondaryLanguage}
          </label>
          <div className="relative w-1/2 flex-1">
            <LanguageLabel
              lang={secondaryLanguage}
              id={`element-${element.id}-title-${secondaryLanguage}-language`}
            >
              <>{secondaryLanguage}</>
            </LanguageLabel>
            <textarea
              className="h-full w-full p-4 focus:outline-blue-focus"
              id={`element-${element.id}-title-${secondaryLanguage}`}
              aria-describedby={`element-${element.id}-title-${secondaryLanguage}-language`}
              value={element.properties[localizeField(field, secondaryLanguage)]}
              onChange={(e) => {
                updateField(propertyPath(element.id, field, secondaryLanguage), e.target.value);
              }}
            />
          </div>
        </div>
      </fieldset>
    </>
  );
};
