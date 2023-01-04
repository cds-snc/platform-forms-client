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

  useEffect(() => {
    setValue(content);
  }, [content]);

  const _debounced = debounce(
    useCallback(
      (value: string) => {
        if (typeof value === "undefined") {
          value = "";
        }
        updateField(path, value);
      },
      [updateField]
    ),
    100
  );

  const updateValue = useCallback(
    (value: string) => {
      setValue(value);
      _debounced(value);
    },
    // exclude _debounced from the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setValue]
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
