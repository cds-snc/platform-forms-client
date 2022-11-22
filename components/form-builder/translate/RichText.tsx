import { FormElement } from "@lib/types";
import { useTranslation } from "next-i18next";
import React from "react";
import { RichTextEditor } from "../lexical-editor/RichTextEditor";
import { useTemplateStore } from "../store/useTemplateStore";
import { Language, LocalizedElementProperties } from "../types";

export const RichText = ({
  element,
  index,
  translationLanguagePriority,
}: {
  element: FormElement;
  index: number;
  translationLanguagePriority: Language;
}) => {
  const { t } = useTranslation("form-builder");
  const localizeField = useTemplateStore((s) => s.localizeField);
  const translationLanguagePriorityAlt = translationLanguagePriority === "en" ? "fr" : "en";

  return (
    <>
      <div className="text-entry">
        <div className="section-heading">
          {t(element.type)}: {t("Description")}
        </div>
        <div className="section-text section-text--rich-text">
          <RichTextEditor
            autoFocusEditor={false}
            path={`form.elements[${index}].properties.${localizeField(
              LocalizedElementProperties.DESCRIPTION,
              translationLanguagePriority
            )}`}
            content={
              element.properties[localizeField(LocalizedElementProperties.DESCRIPTION, "en")] ?? ""
            }
            lang={translationLanguagePriority}
            ariaLabel={t("pageText") + " " + t(translationLanguagePriority)}
          />
          <RichTextEditor
            autoFocusEditor={false}
            path={`form.elements[${index}].properties.${localizeField(
              LocalizedElementProperties.DESCRIPTION,
              translationLanguagePriorityAlt
            )}`}
            content={
              element.properties[localizeField(LocalizedElementProperties.DESCRIPTION, "fr")] ?? ""
            }
            lang={translationLanguagePriorityAlt}
            ariaLabel={t("pageText") + " " + t(translationLanguagePriorityAlt)}
          />
        </div>
      </div>
    </>
  );
};
