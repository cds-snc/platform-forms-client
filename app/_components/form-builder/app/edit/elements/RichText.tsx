import React from "react";
import { useTemplateStore } from "../../../store/useTemplateStore";
import { RichTextEditor } from "./lexical-editor/RichTextEditor";
import { LocalizedElementProperties } from "../../../types";
import { getPath } from "../../../getPath";
import { useTranslation } from "next-i18next";

export const RichText = ({ id, elIndex }: { id: number; elIndex: number }) => {
  const { t } = useTranslation("form-builder");
  const { translationLanguagePriority, localizeField, form, propertyPath } = useTemplateStore(
    (s) => ({
      localizeField: s.localizeField,
      translationLanguagePriority: s.translationLanguagePriority,
      form: s.form,
      lang: s.lang,
      propertyPath: s.propertyPath,
    })
  );

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
    <div key={translationLanguagePriority} className="flex border-2 rounded" data-testid="richText">
      <RichTextEditor
        path={path}
        content={content || ""}
        lang={translationLanguagePriority}
        ariaLabel={t("pageText") + " " + (elIndex + 1).toString()}
      />
    </div>
  );
};
