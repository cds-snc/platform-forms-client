import React from "react";
import { useTemplateStore } from "../../store/useTemplateStore";
import { Language, LocalizedElementProperties } from "../../types";
import { useTranslation } from "next-i18next";
import { FormElement } from "@lib/types";
import { LanguageLabel } from "./LanguageLabel";

export const Description = ({
  element,
  index,
  translationLanguagePriority,
}: {
  element: FormElement;
  index: number;
  translationLanguagePriority: Language;
}) => {
  const { updateField, localizeField } = useTemplateStore((s) => ({
    updateField: s.updateField,
    localizeField: s.localizeField,
  }));
  const { t } = useTranslation("form-builder");
  const translationLanguagePriorityAlt = translationLanguagePriority === "en" ? "fr" : "en";

  return (
    <>
      <fieldset className="text-entry">
        <legend className="section-heading">
          {t(element.type)}: {t("Description")}
        </legend>
        <div className="section-text">
          <label
            className="sr-only"
            htmlFor={`element-${element.id}-description-${translationLanguagePriority}`}
          >
            {t(`${translationLanguagePriority}-text`)}
          </label>
          <div className="relative">
            <LanguageLabel
              lang={translationLanguagePriority}
              id={`element-${element.id}-description-${translationLanguagePriority}-language`}
            >
              {t(translationLanguagePriority)}
            </LanguageLabel>
            <textarea
              id={`element-${element.id}-description-${translationLanguagePriority}`}
              aria-describedby={`element-${element.id}-description-${translationLanguagePriority}-language`}
              value={
                element.properties[
                  localizeField(LocalizedElementProperties.DESCRIPTION, translationLanguagePriority)
                ]
              }
              onChange={(e) => {
                updateField(
                  `form.elements[${index}].properties.${localizeField(
                    LocalizedElementProperties.DESCRIPTION,
                    translationLanguagePriority
                  )}`,
                  e.target.value
                );
              }}
            ></textarea>
          </div>
          <label
            className="sr-only"
            htmlFor={`element-${element.id}-description-${translationLanguagePriorityAlt}`}
          >
            {t(`${translationLanguagePriorityAlt}-text`)}
          </label>
          <div className="relative">
            <LanguageLabel
              lang={translationLanguagePriorityAlt}
              id={`element-${element.id}-description-${translationLanguagePriorityAlt}-language`}
            >
              {t(translationLanguagePriorityAlt)}
            </LanguageLabel>
            <textarea
              id={`element-${element.id}-description-${translationLanguagePriorityAlt}`}
              aria-describedby={`element-${element.id}-description-${translationLanguagePriorityAlt}-language`}
              value={
                element.properties[
                  localizeField(
                    LocalizedElementProperties.DESCRIPTION,
                    translationLanguagePriorityAlt
                  )
                ]
              }
              onChange={(e) => {
                updateField(
                  `form.elements[${index}].properties.${localizeField(
                    LocalizedElementProperties.DESCRIPTION,
                    translationLanguagePriorityAlt
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
