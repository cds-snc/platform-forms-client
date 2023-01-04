import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import debounce from "lodash.debounce";

import { Input } from "@formbuilder/app/shared";
import { Language } from "@formbuilder/types";
import { useTemplateStore } from "@formbuilder/store";

export const QuestionInput = ({
  index,
  hasDescription,
  initialValue,
  onQuestionChange,
}: {
  index: number;
  hasDescription: string | undefined;
  initialValue: string;
  onQuestionChange: (itemIndex: number, val: string, lang: Language) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const [value, setValue] = useState(initialValue);
  const { getFocusInput, setFocusInput, translationLanguagePriority, getLocalizationAttribute } =
    useTemplateStore((s) => ({
      setFocusInput: s.setFocusInput,
      getFocusInput: s.getFocusInput,
      translationLanguagePriority: s.translationLanguagePriority,
      getLocalizationAttribute: s.getLocalizationAttribute,
    }));

  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // see: https://github.com/cds-snc/platform-forms-client/pull/1194/commits/cf2d08676cb9dfa7bb500f713cc16cdf653c3e93
    if (input.current && getFocusInput()) {
      input.current.focus();
      setFocusInput(false);
    }
  }, [getFocusInput]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const _debounced = useCallback(
    debounce((index, val, lang) => {
      onQuestionChange(index, val, lang);
    }, 100),
    [onQuestionChange]
  );

  const updateValue = useCallback(
    (index: number, value: string) => {
      setValue(value);
      _debounced(index, value, translationLanguagePriority);
    },
    [setValue, translationLanguagePriority]
  );

  return (
    <Input
      ref={input}
      type="text"
      id={`item${index}`}
      name={`item${index}`}
      placeholder={t("question")}
      className="w-full"
      value={value}
      aria-describedby={hasDescription ? `item${index}-describedby` : undefined}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateValue(index, e.target.value)}
      theme="title"
      {...getLocalizationAttribute()}
    />
  );
};
