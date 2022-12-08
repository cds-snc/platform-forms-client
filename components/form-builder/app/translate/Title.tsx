import React from "react";
import { useTemplateStore } from "../../store/useTemplateStore";
import { Language, LocalizedElementProperties } from "../../types";
import { useTranslation } from "next-i18next";
import { FormElement } from "@lib/types";
import { LanguageLabel } from "./LanguageLabel";
import { FieldsetLegend } from ".";

export const Title = ({
  element,
  index,
  primaryLanguage,
}: {
  element: FormElement;
  index: number;
  primaryLanguage: Language;
}) => {
  const { updateField, localizeField } = useTemplateStore((s) => ({
    updateField: s.updateField,
    localizeField: s.localizeField,
  }));
  const { t } = useTranslation("form-builder");
  const secondaryLanguage = primaryLanguage === "en" ? "fr" : "en";

  return (
    <>
      <fieldset>
        <FieldsetLegend>
          {t(element.type)}: {t("questionTitle")}
        </FieldsetLegend>
        <div className="flex gap-px border-b border-r border-t border-gray-300 mb-10 divide-x-2">
          <label className="sr-only" htmlFor={`element-${element.id}-title-${primaryLanguage}`}>
            {t(`${primaryLanguage}-text`)}
          </label>
          <div className="w-1/2 flex-1 relative">
            <LanguageLabel
              lang={primaryLanguage}
              id={`element-${element.id}-title-${primaryLanguage}-language`}
            >
              {t(primaryLanguage)}
            </LanguageLabel>
            <textarea
              className="w-full p-4 h-full"
              id={`element-${element.id}-title-${primaryLanguage}`}
              aria-describedby={`element-${element.id}-title-${primaryLanguage}-language`}
              value={
                element.properties[localizeField(LocalizedElementProperties.TITLE, primaryLanguage)]
              }
              onChange={(e) => {
                updateField(
                  `form.elements[${index}].properties.${localizeField(
                    LocalizedElementProperties.TITLE,
                    primaryLanguage
                  )}`,
                  e.target.value
                );
              }}
            />
          </div>
          <label className="sr-only" htmlFor={`element-${element.id}-title-${secondaryLanguage}`}>
            {t(`${secondaryLanguage}-text`)}
          </label>
          <div className="w-1/2 flex-1 relative">
            <LanguageLabel
              lang={secondaryLanguage}
              id={`element-${element.id}-title-${secondaryLanguage}-language`}
            >
              {t(secondaryLanguage)}
            </LanguageLabel>
            <textarea
              className="w-full p-4 h-full"
              id={`element-${element.id}-title-${secondaryLanguage}`}
              aria-describedby={`element-${element.id}-title-${secondaryLanguage}-language`}
              value={
                element.properties[
                  localizeField(LocalizedElementProperties.TITLE, secondaryLanguage)
                ]
              }
              onChange={(e) => {
                updateField(
                  `form.elements[${index}].properties.${localizeField(
                    LocalizedElementProperties.TITLE,
                    secondaryLanguage
                  )}`,
                  e.target.value
                );
              }}
            />
          </div>
        </div>
      </fieldset>
    </>
  );
};
