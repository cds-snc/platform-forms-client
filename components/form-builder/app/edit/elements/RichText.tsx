import React from "react";
import { useTemplateStore } from "../../../store/useTemplateStore";
import { RichTextEditor } from "./lexical-editor/RichTextEditor";
import { LocalizedElementProperties } from "../../../types";
import { useTranslation } from "next-i18next";

export const RichText = ({ elIndex, subIndex = -1 }: { elIndex: number; subIndex?: number }) => {
  const { t } = useTranslation("form-builder");
  const { translationLanguagePriority, localizeField, form } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
    form: s.form,
    lang: s.lang,
  }));

  const localizedField = localizeField(
    LocalizedElementProperties.DESCRIPTION,
    translationLanguagePriority
  );

  let path = `form.elements[${elIndex}].properties[${localizedField}]`;
  let content = form.elements[elIndex].properties[localizedField];

  if (subIndex !== -1) {
    path = `form.elements[${elIndex}].properties.subElements[${subIndex}].properties[${localizedField}]`;
    content =
      form.elements[elIndex].properties.subElements?.[subIndex].properties[localizedField] || "";
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
