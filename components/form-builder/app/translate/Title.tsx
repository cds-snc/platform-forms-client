import React from "react";
import { useTemplateStore } from "../../store/useTemplateStore";
import { Language, LocalizedElementProperties } from "../../types";
import { useTranslation } from "next-i18next";
import { FormElement } from "@lib/types";
import { LanguageLabel } from "./LanguageLabel";

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
      <fieldset className="text-entry">
        <legend className="section-heading">
          {t(element.type)}: {t("questionTitle")}
        </legend>
        <div className="section-text divide-x-2">
          <label className="sr-only" htmlFor={`element-${element.id}-title-${primaryLanguage}`}>
            {t(`${primaryLanguage}-text`)}
          </label>
          <div className="relative">
            <LanguageLabel
              lang={primaryLanguage}
              id={`element-${element.id}-title-${primaryLanguage}-language`}
            >
              {t(primaryLanguage)}
            </LanguageLabel>
            <textarea
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
          <div className="relative">
            <LanguageLabel
              lang={secondaryLanguage}
              id={`element-${element.id}-title-${secondaryLanguage}-language`}
            >
              {t(secondaryLanguage)}
            </LanguageLabel>
            <textarea
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
