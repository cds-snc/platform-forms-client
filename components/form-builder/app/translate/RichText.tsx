import { FormElement } from "@lib/types";
import { useTranslation } from "next-i18next";
import React from "react";
import { RichTextEditor } from "../edit/elements/lexical-editor/RichTextEditor";
import { useTemplateStore } from "../../store/useTemplateStore";
import { Language, LocalizedElementProperties } from "../../types";
import { LanguageLabel } from "./LanguageLabel";

export const RichText = ({
  element,
  index,
  primaryLanguage,
}: {
  element: FormElement;
  index: number;
  primaryLanguage: Language;
}) => {
  const { t } = useTranslation("form-builder");
  const localizeField = useTemplateStore((s) => s.localizeField);
  const secondaryLanguage = primaryLanguage === "en" ? "fr" : "en";

  return (
    <>
      <div className="text-entry">
        <div className="section-heading">
          {t(element.type)}: {t("Description")}
        </div>
        <div className="section-text section-text--rich-text divide-x-2">
          <div className="relative">
            <LanguageLabel
              id={`elements-${index}-description-${primaryLanguage}-language`}
              lang={primaryLanguage}
            >
              {t(primaryLanguage)}
            </LanguageLabel>
            <RichTextEditor
              autoFocusEditor={false}
              path={`form.elements[${index}].properties.${localizeField(
                LocalizedElementProperties.DESCRIPTION,
                primaryLanguage
              )}`}
              content={
                element.properties[localizeField(LocalizedElementProperties.DESCRIPTION, "en")] ??
                ""
              }
              lang={primaryLanguage}
              ariaLabel={t("pageText") + " " + t(primaryLanguage)}
              ariaDescribedBy={`elements-${index}-description-${primaryLanguage}-language`}
            />
          </div>
          <div className="relative">
            <LanguageLabel
              id={`elements-${index}-description-${secondaryLanguage}-language`}
              lang={secondaryLanguage}
            >
              {t(secondaryLanguage)}
            </LanguageLabel>
            <RichTextEditor
              autoFocusEditor={false}
              path={`form.elements[${index}].properties.${localizeField(
                LocalizedElementProperties.DESCRIPTION,
                secondaryLanguage
              )}`}
              content={
                element.properties[localizeField(LocalizedElementProperties.DESCRIPTION, "fr")] ??
                ""
              }
              lang={secondaryLanguage}
              ariaLabel={t("pageText") + " " + t(secondaryLanguage)}
              ariaDescribedBy={`elements-${index}-description-${secondaryLanguage}-language`}
            />
          </div>
        </div>
      </div>
    </>
  );
};
