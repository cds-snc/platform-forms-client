import React from "react";
import useTemplateStore from "../store/useTemplateStore";
import { ElementType, LocalizedElementProperties } from "../types";
import { useTranslation } from "next-i18next";

export const Description = ({
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
          <span>{t(element.type)}</span>
          <span>{t("Description")}</span>
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
