import React from "react";
import { useTemplateStore } from "../store/useTemplateStore";
import { RichTextEditor } from "../lexical-editor/RichTextEditor";
import { LocalizedElementProperties } from "../types";

export const RichText = ({ parentIndex }: { parentIndex: number }) => {
  const { localizeField, form, lang } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    form: s.form,
    lang: s.lang,
  }));

  const content =
    form.elements[parentIndex].properties[localizeField(LocalizedElementProperties.DESCRIPTION)] ??
    "";

  return (
    <div className="flex mx-7 mt-5 mb-7 border-2 rounded">
      <RichTextEditor
        autoFocusEditor={true}
        path={`form.elements[${parentIndex}].properties.${localizeField(
          LocalizedElementProperties.DESCRIPTION
        )}`}
        content={content}
        lang={lang}
      />
    </div>
  );
};
