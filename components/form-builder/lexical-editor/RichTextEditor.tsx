import React, { useCallback, useState, useEffect } from "react";
import { Editor } from "./Editor";
import { useTemplateStore } from "../store/useTemplateStore";
import { Language } from "../types";
import debounce from "lodash.debounce";

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
  const updateField = useTemplateStore((s) => s.updateField);
  const [value, setValue] = useState(content);

  const _debounced = useCallback(
    debounce((value: string) => {
      if (typeof value === "undefined") {
        value = "";
      }
      updateField(path, value);
    }, 100),
    []
  );

  useEffect(() => {
    setValue(content);
  }, [content]);

  const updateValue = useCallback(
    (value: string) => {
      setValue(value);
      _debounced(value);
    },
    [setValue]
  );

  return (
    <div key={lang} className="w-full">
      <Editor autoFocusEditor={autoFocusEditor} content={value} onChange={updateValue} />
    </div>
  );
};
