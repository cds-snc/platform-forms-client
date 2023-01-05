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
  const { updateField, getLocalizationAttribute } = useTemplateStore((s) => ({
    updateField: s.updateField,
    getLocalizationAttribute: s.getLocalizationAttribute,
  }));
  const [value, setValue] = useState(content);
  const { t } = useTranslation("form-builder");

  const _debounced = debounce(
    useCallback(
      (value: string) => {
        if (typeof value === "undefined") {
          value = "";
        }
        updateField(path, value);
      },
      [updateField, path]
    ),
    100
  );

  useEffect(() => {
    setValue(content);
  }, [content]);

  const updateValue = useCallback(
    (value: string) => {
      setValue(value);
      _debounced(value);
    },
    [setValue, _debounced]
  );

  return (
    <div className="w-full">
      <Editor
        autoFocusEditor={autoFocusEditor}
        content={value}
        onChange={updateValue}
        ariaLabel={ariaLabel || t("richTextEditor")}
        ariaDescribedBy={ariaDescribedBy}
        {...getLocalizationAttribute()}
      />
    </div>
  );
};
