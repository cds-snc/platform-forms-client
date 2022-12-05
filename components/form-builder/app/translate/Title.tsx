import React from "react";
import { useTemplateStore } from "../../store/useTemplateStore";
import { Language, LocalizedElementProperties } from "../../types";
import { useTranslation } from "next-i18next";
import { FormElement } from "@lib/types";
import { LanguageLabel } from "./LanguageLabel";

export const Title = ({
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
          {t(element.type)}: {t("questionTitle")}
        </legend>
        <div className="section-text">
          <label
            className="sr-only"
            htmlFor={`element-${element.id}-title-${translationLanguagePriority}`}
          >
            {t(`${translationLanguagePriority}-text`)}
          </label>
          <div className="relative">
            <LanguageLabel
              lang={translationLanguagePriority}
              id={`element-${element.id}-title-${translationLanguagePriority}-language`}
            >
              {t(translationLanguagePriority)}
            </LanguageLabel>
            <textarea
              id={`element-${element.id}-title-${translationLanguagePriority}`}
              aria-describedby={`element-${element.id}-title-${translationLanguagePriority}-language`}
              value={
                element.properties[
                  localizeField(LocalizedElementProperties.TITLE, translationLanguagePriority)
                ]
              }
              onChange={(e) => {
                updateField(
                  `form.elements[${index}].properties.${localizeField(
                    LocalizedElementProperties.TITLE,
                    translationLanguagePriority
                  )}`,
                  e.target.value
                );
              }}
            />
          </div>
          <label
            className="sr-only"
            htmlFor={`element-${element.id}-title-${translationLanguagePriorityAlt}`}
          >
            {t(`${translationLanguagePriorityAlt}-text`)}
          </label>
          <div className="relative">
            <LanguageLabel
              lang={translationLanguagePriorityAlt}
              id={`element-${element.id}-title-${translationLanguagePriorityAlt}-language`}
            >
              {t(translationLanguagePriorityAlt)}
            </LanguageLabel>
            <textarea
              id={`element-${element.id}-title-${translationLanguagePriorityAlt}`}
              aria-describedby={`element-${element.id}-title-${translationLanguagePriorityAlt}-language`}
              value={
                element.properties[
                  localizeField(LocalizedElementProperties.TITLE, translationLanguagePriorityAlt)
                ]
              }
              onChange={(e) => {
                updateField(
                  `form.elements[${index}].properties.${localizeField(
                    LocalizedElementProperties.TITLE,
                    translationLanguagePriorityAlt
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
