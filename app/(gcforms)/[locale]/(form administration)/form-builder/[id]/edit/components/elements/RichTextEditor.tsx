"use client";
import React, { useCallback, useState, useEffect } from "react";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Language } from "@lib/types/form-builder-types";
import debounce from "lodash.debounce";
import { useTranslation } from "@i18n/client";
import { Editor } from "@gcforms/editor";

const _debounced = debounce((updater) => {
  updater();
}, 100);

export const RichTextEditor = ({
  path,
  content,
  lang,
  ariaLabel,
  ariaDescribedBy,
  maxChars = 50000,
}: {
  path: string;
  content: string;
  lang: Language;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  maxChars?: number;
}) => {
  const { updateField, getLocalizationAttribute } = useTemplateStore((s) => ({
    updateField: s.updateField,
    getLocalizationAttribute: s.getLocalizationAttribute,
  }));
  const [value, setValue] = useState(content);
  const { t, i18n } = useTranslation("form-builder");

  useEffect(() => {
    setValue(content);
  }, [content]);

  const updateValue = useCallback(
    (value: string) => {
      setValue(value);
      _debounced(() => updateField(path, value));
    },
    [setValue, path, updateField]
  );

  return (
    <div className="gc-formview w-full rounded bg-white">
      <Editor
        maxLength={maxChars}
        locale={i18n.language}
        contentLocale={lang}
        content={value}
        onChange={updateValue}
        ariaLabel={ariaLabel || t("richTextEditor")}
        ariaDescribedBy={ariaDescribedBy}
        className="gc-formview gc-richText"
        {...getLocalizationAttribute()}
      />
    </div>
  );
};
