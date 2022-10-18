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
      <div className="text-entry">
        <div>
          <span className="section">{t(element.type)}</span>
          <span className="description">Question title</span>
          <textarea
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
        <div>
          <textarea
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
    </>
  );
};
