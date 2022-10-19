import React from "react";
import useTemplateStore from "../store/useTemplateStore";
import { ElementType, Language, LocalizedElementProperties } from "../types";
import { useTranslation } from "next-i18next";

export const Description = ({
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
      <div className="text-entry">
        <div className="section-heading">
          {t(element.type)}: {t("Description")}
        </div>
        <div className="section-text">
          <textarea
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
          <textarea
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
    </>
  );
};
