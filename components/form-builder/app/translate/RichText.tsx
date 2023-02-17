import { FormElement } from "@lib/types";
import { useTranslation } from "next-i18next";
import React from "react";
import { RichTextEditor } from "../edit/elements/lexical-editor/RichTextEditor";
import { useTemplateStore } from "../../store/useTemplateStore";
import { Language, LocalizedElementProperties } from "../../types";
import { LanguageLabel } from "./LanguageLabel";
import { FieldsetLegend } from "./FieldsetLegend";

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
  const { localizeField } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    // getPropertyPath: s.getPropertyPath,
  }));
  const secondaryLanguage = primaryLanguage === "en" ? "fr" : "en";

  // console.log(getPropertyPath(element.id, LocalizedElementProperties.DESCRIPTION, primaryLanguage));

  return (
    <>
      <div className="text-entry">
        <FieldsetLegend>
          {t(element.type)}: {t("inputDescription")}
        </FieldsetLegend>
        <div className="flex gap-px border border-gray-300 mb-10 divide-x-2">
          <div className="w-1/2 flex-1 relative">
            <LanguageLabel
              id={`elements-${index}-description-${primaryLanguage}-language`}
              lang={primaryLanguage}
            >
              <>{t(primaryLanguage)}</>
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
          <div className="w-1/2 flex-1 relative">
            <LanguageLabel
              id={`elements-${index}-description-${secondaryLanguage}-language`}
              lang={secondaryLanguage}
            >
              <>{t(secondaryLanguage)}</>
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
