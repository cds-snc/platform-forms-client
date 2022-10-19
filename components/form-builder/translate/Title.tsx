import React from "react";
import useTemplateStore from "../store/useTemplateStore";
import { ElementType, Language, LocalizedElementProperties } from "../types";
import { useTranslation } from "next-i18next";

export const Title = ({
  element,
  index,
  translationLanguagePriority,
}: {
  element: ElementType;
  index: number;
  translationLanguagePriority: Language;
}) => {
  const { updateField, localizeField } = useTemplateStore();
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
            English text
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
            French text
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
