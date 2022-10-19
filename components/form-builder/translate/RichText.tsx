import { useTranslation } from "next-i18next";
import React from "react";
import useTemplateStore from "../store/useTemplateStore";
import { ElementType, Language, LocalizedElementProperties } from "../types";
import { Editor } from "./Editor";

export const RichText = ({
  element,
  index,
  translationLanguagePriority,
}: {
  element: ElementType;
  index: number;
  translationLanguagePriority: Language;
}) => {
  const { t } = useTranslation("form-builder");
  const { localizeField } = useTemplateStore();
  const translationLanguagePriorityAlt = translationLanguagePriority === "en" ? "fr" : "en";

  return (
    <>
      <div className="text-entry">
        <div className="section-heading">
          {t(element.type)}: {t("Description")}
        </div>
        <div className="section-text">
          <Editor
            path={`form.elements[${index}].properties.${localizeField(
              LocalizedElementProperties.DESCRIPTION,
              "en"
            )}`}
            content={
              element.properties[localizeField(LocalizedElementProperties.DESCRIPTION, "en")]
            }
            index="${index}"
            language={translationLanguagePriority}
          />
          <Editor
            path={`form.elements[${index}].properties.${localizeField(
              LocalizedElementProperties.DESCRIPTION,
              "fr"
            )}`}
            content={
              element.properties[localizeField(LocalizedElementProperties.DESCRIPTION, "fr")]
            }
            index="${index}"
            language={translationLanguagePriorityAlt}
          />
        </div>
      </div>
    </>
  );
};
