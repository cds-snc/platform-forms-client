"use client";
import React from "react";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { RichTextEditor } from "@formBuilder/[id]/edit/components/elements/RichTextEditor";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";
import { getPath } from "@lib/utils/form-builder/getPath";
import { useTranslation } from "@i18n/client";

/**
 * Self-contained builder editor for richText elements.
 * Sourced from elements/RichText.tsx — kept here so the richText plugin has
 * no direct dependency on the form-builder elements directory.
 */
export const BuilderEditor = ({ id, elIndex }: { id: number; elIndex: number }) => {
  const { t } = useTranslation("form-builder");
  const { translationLanguagePriority, localizeField, form, propertyPath, changeKey } =
    useTemplateStore((s) => ({
      localizeField: s.localizeField,
      translationLanguagePriority: s.translationLanguagePriority,
      form: s.form,
      lang: s.lang,
      propertyPath: s.propertyPath,
      changeKey: s.changeKey,
    }));

  const localizedField = localizeField(
    LocalizedElementProperties.DESCRIPTION,
    translationLanguagePriority
  );

  const path = propertyPath(id, localizedField);
  let content = "";

  const element = getPath(id, form);
  if (element && element.properties && element.properties[localizedField]) {
    content = element.properties[localizedField] || "";
  }

  return (
    <div key={translationLanguagePriority} className="flex rounded border-2" data-testid="richText">
      <RichTextEditor
        key={`${path}:${translationLanguagePriority}:${changeKey}`}
        path={path}
        content={content || ""}
        lang={translationLanguagePriority}
        ariaLabel={t("pageText") + " " + (elIndex + 1).toString()}
      />
    </div>
  );
};
