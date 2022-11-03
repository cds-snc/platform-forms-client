import React from "react";
import { useTemplateStore } from "../store/useTemplateStore";
import { Language, LocalizedElementProperties } from "../types";
import { useTranslation } from "next-i18next";
import { FormElement } from "@lib/types";

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
          {t(element.type)}: {t("Question title")}
        </legend>
        <div className="section-text">
          <label
            className="sr-only"
            htmlFor={`element-${element.id}-title-${translationLanguagePriority}`}
          >
            {t(`${translationLanguagePriority}-text`)}
          </label>
          <textarea
            id={`element-${element.id}-title-${translationLanguagePriority}`}
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
          <label
            className="sr-only"
            htmlFor={`element-${element.id}-title-${translationLanguagePriorityAlt}`}
          >
            {t(`${translationLanguagePriorityAlt}-text`)}
          </label>
          <textarea
            id={`element-${element.id}-title-${translationLanguagePriorityAlt}`}
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
      </fieldset>
    </>
  );
};
