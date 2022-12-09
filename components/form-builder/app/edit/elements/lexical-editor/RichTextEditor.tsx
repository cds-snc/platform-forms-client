import React, { useCallback, useState, useEffect } from "react";
import { Editor } from "./Editor";
import { useTemplateStore } from "../../../../store/useTemplateStore";
import { Language } from "../../../../types";
import debounce from "lodash.debounce";
import { useTranslation } from "next-i18next";

export const RichTextEditor = ({
  path,
  content,
  autoFocusEditor,
  lang,
  ariaLabel,
  ariaDescribedBy,
}: {
  path: string;
  content: string;
  autoFocusEditor?: boolean;
  lang: Language;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}) => {
  const updateField = useTemplateStore((s) => s.updateField);
  const [value, setValue] = useState(content);
  const { t, i18n } = useTranslation("form-builder");

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
      <Editor
        autoFocusEditor={autoFocusEditor}
        content={value}
        onChange={updateValue}
        ariaLabel={ariaLabel || t("richTextEditor")}
        ariaDescribedBy={ariaDescribedBy}
        {...(i18n.language !== lang && { lang: lang })}
      />
    </div>
  );
};
