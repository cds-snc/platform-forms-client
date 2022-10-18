import React from "react";
import useTemplateStore from "../store/useTemplateStore";
import { ElementType, LocalizedElementProperties } from "../types";
import { useTranslation } from "next-i18next";

export const Title = ({
  element,
  translationLanguagePriority,
}: {
  element: ElementType;
  index: number;
  translationLanguagePriority: string;
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
          <input
            type="text"
            value={
              element.properties[
                localizeField(LocalizedElementProperties.TITLE, translationLanguagePriority)
              ]
            }
            onChange={(e) => {
              updateField(
                `element.properties.${localizeField(
                  LocalizedElementProperties.TITLE,
                  translationLanguagePriority
                )}`,
                e.target.value
              );
            }}
          />
        </div>
        <div>
          <input
            type="text"
            value={
              element.properties[
                localizeField(LocalizedElementProperties.TITLE, translationLanguagePriorityAlt)
              ]
            }
            onChange={(e) => {
              updateField(
                `element.properties.${localizeField(
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
