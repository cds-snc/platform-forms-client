"use client";
import { FormElement } from "@lib/types";
import { useTranslation } from "@i18n/client";
import React from "react";
import { RichTextEditor } from "../../components/elements/RichTextEditor";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Language, LocalizedElementProperties } from "@lib/types/form-builder-types";
import { LanguageLabel } from "@formBuilder/components/shared/LanguageLabel";
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
  const { localizeField, propertyPath } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    propertyPath: s.propertyPath,
  }));
  const secondaryLanguage = primaryLanguage === "en" ? "fr" : "en";
  const field = LocalizedElementProperties.DESCRIPTION;
  const fieldEn = localizeField(field, "en");
  const fieldFr = localizeField(field, "fr");

  return (
    <>
      <div className="text-entry">
        <FieldsetLegend>{t(element.type)}</FieldsetLegend>
        <div className="mb-10 flex gap-px divide-x-2 border border-gray-300">
          <div className="relative w-1/2 flex-1">
            <RichTextEditor
              path={propertyPath(element.id, field, primaryLanguage)}
              content={element.properties[fieldEn] ?? ""}
              lang={primaryLanguage}
              ariaLabel={t("pageText") + " " + t(primaryLanguage)}
              ariaDescribedBy={`elements-${index}-description-${primaryLanguage}-language`}
            />
            <LanguageLabel
              id={`elements-${index}-description-${primaryLanguage}-language`}
              lang={primaryLanguage}
            >
              <>{primaryLanguage}</>
            </LanguageLabel>
          </div>
          <div className="relative w-1/2 flex-1">
            <RichTextEditor
              path={propertyPath(element.id, field, secondaryLanguage)}
              content={element.properties[fieldFr] ?? ""}
              lang={secondaryLanguage}
              ariaLabel={t("pageText") + " " + secondaryLanguage}
              ariaDescribedBy={`elements-${index}-description-${secondaryLanguage}-language`}
            />
            <LanguageLabel
              id={`elements-${index}-description-${secondaryLanguage}-language`}
              lang={secondaryLanguage}
            >
              <>{secondaryLanguage}</>
            </LanguageLabel>
          </div>
        </div>
      </div>
    </>
  );
};
