import React from "react";
import { Editor } from "./Editor";
import useTemplateStore from "../store/useTemplateStore";
import { Language } from "../types";

export const RichTextEditor = ({
  path,
  content,
  autoFocusEditor,
  lang,
}: {
  path: string;
  content: string;
  autoFocusEditor?: boolean;
  lang: Language;
}) => {
  const { updateField } = useTemplateStore();
  const handleChange = (value: string) => {
    if (typeof value === "undefined") {
      value = "";
    }
    updateField(path, value);
  };

  return (
    <div key={lang} className="mx-7 mb-6 mt-2 w-full border-2 rounded">
      <Editor autoFocusEditor={autoFocusEditor} content={content} onChange={handleChange} />
    </div>
  );
};
