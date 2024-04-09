"use client";
import React, { useCallback, useState, useEffect } from "react";
import { Editor } from "./Editor";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Language } from "@lib/types/form-builder-types";
import debounce from "lodash.debounce";
import { useTranslation } from "@i18n/client";

const _debounced = debounce((updater) => {
  updater();
}, 100);

export const RichTextEditor = ({
  path,
  content,
  ariaLabel,
  ariaDescribedBy,
}: {
  path: string;
  content: string;
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

  const updateValue = useCallback(
    (value: string) => {
      setValue(value);
      _debounced(() => updateField(path, value));
    },
    [setValue, path, updateField]
  );

  return (
    <div className="w-full rounded bg-white">
      <Editor
        content={value}
        onChange={updateValue}
        ariaLabel={ariaLabel || t("richTextEditor")}
        ariaDescribedBy={ariaDescribedBy}
        {...getLocalizationAttribute()}
      />
    </div>
  );
};
