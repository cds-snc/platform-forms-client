import React from "react";
import useTemplateStore from "../store/useTemplateStore";
import { ElementType, Language, LocalizedElementProperties } from "../types";
import { useTranslation } from "next-i18next";

export const Description = ({
  element,
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
          <span className="description">{t("Description")}</span>
          <textarea
            value={
              element.properties[
                localizeField(LocalizedElementProperties.DESCRIPTION, translationLanguagePriority)
              ]
            }
            onChange={(e) => {
              updateField(
                `element.properties.${localizeField(
                  LocalizedElementProperties.DESCRIPTION,
                  translationLanguagePriority
                )}`,
                e.target.value
              );
            }}
          ></textarea>
        </div>
        <div>
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
                `element.properties.${localizeField(
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
