import React from "react";
import { useTemplateStore } from "../../store/useTemplateStore";
import { Language, LocalizedElementProperties } from "../../types";
import { useTranslation } from "next-i18next";
import { FormElement } from "@lib/types";
import { LanguageLabel } from "./LanguageLabel";

export const Description = ({
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
          {t(element.type)}: {t("Description")}
        </legend>
        <div className="section-text divide-x-2">
          <label
            className="sr-only"
            htmlFor={`element-${element.id}-description-${primaryLanguage}`}
          >
            {t(`${primaryLanguage}-text`)}
          </label>
          <div className="relative">
            <LanguageLabel
              lang={primaryLanguage}
              id={`element-${element.id}-description-${primaryLanguage}-language`}
            >
              {t(primaryLanguage)}
            </LanguageLabel>
            <textarea
              id={`element-${element.id}-description-${primaryLanguage}`}
              aria-describedby={`element-${element.id}-description-${primaryLanguage}-language`}
              value={
                element.properties[
                  localizeField(LocalizedElementProperties.DESCRIPTION, primaryLanguage)
                ]
              }
              onChange={(e) => {
                updateField(
                  `form.elements[${index}].properties.${localizeField(
                    LocalizedElementProperties.DESCRIPTION,
                    primaryLanguage
                  )}`,
                  e.target.value
                );
              }}
            ></textarea>
          </div>
          <label
            className="sr-only"
            htmlFor={`element-${element.id}-description-${secondaryLanguage}`}
          >
            {t(`${secondaryLanguage}-text`)}
          </label>
          <div className="relative">
            <LanguageLabel
              lang={secondaryLanguage}
              id={`element-${element.id}-description-${secondaryLanguage}-language`}
            >
              {t(secondaryLanguage)}
            </LanguageLabel>
            <textarea
              id={`element-${element.id}-description-${secondaryLanguage}`}
              aria-describedby={`element-${element.id}-description-${secondaryLanguage}-language`}
              value={
                element.properties[
                  localizeField(LocalizedElementProperties.DESCRIPTION, secondaryLanguage)
                ]
              }
              onChange={(e) => {
                updateField(
                  `form.elements[${index}].properties.${localizeField(
                    LocalizedElementProperties.DESCRIPTION,
                    secondaryLanguage
                  )}`,
                  e.target.value
                );
              }}
            ></textarea>
          </div>
        </div>
      </fieldset>
    </>
  );
};
