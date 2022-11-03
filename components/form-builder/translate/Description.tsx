import React from "react";
import { useTemplateStore } from "../store/useTemplateStore";
import { Language, LocalizedElementProperties } from "../types";
import { useTranslation } from "next-i18next";
import { FormElement } from "@lib/types";

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
          <textarea
            id={`element-${element.id}-description-${translationLanguagePriority}`}
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
          <label
            className="sr-only"
            htmlFor={`element-${element.id}-description-${translationLanguagePriorityAlt}`}
          >
            {t(`${translationLanguagePriorityAlt}-text`)}
          </label>
          <textarea
            id={`element-${element.id}-description-${translationLanguagePriorityAlt}`}
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
      </fieldset>
    </>
  );
};
