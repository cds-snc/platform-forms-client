import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import debounce from "lodash.debounce";

import { Input } from "@formbuilder/app/shared";
import { Language } from "@formbuilder/types";
import { useTemplateStore } from "@formbuilder/store";

export const QuestionInput = ({
  index,
  id,
  initialValue,
  onQuestionChange,
  questionInputRef,
  describedById,
}: {
  index: number;
  id: number;
  initialValue: string;
  onQuestionChange: (itemIndex: number, val: string, lang: Language) => void;
  questionInputRef: React.RefObject<HTMLInputElement>;
  describedById?: string;
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

  useEffect(() => {
    // see: https://github.com/cds-snc/platform-forms-client/pull/1194/commits/cf2d08676cb9dfa7bb500f713cc16cdf653c3e93
    if (questionInputRef && questionInputRef.current && getFocusInput()) {
      questionInputRef.current.focus();
      setFocusInput(false);
    }
  }, [getFocusInput, setFocusInput, questionInputRef]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const _debounced = debounce(
    useCallback(
      (index: number, value: string, lang: Language) => {
        onQuestionChange(index, value, lang);
      },
      [onQuestionChange]
    ),
    100
  );

  const updateValue = useCallback(
    (index: number, value: string) => {
      setValue(value);
      _debounced(index, value, translationLanguagePriority);
    },
    // exclude _debounced from the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setValue, translationLanguagePriority]
  );

  return (
    <Input
      ref={questionInputRef}
      type="text"
      id={`item-${id}`}
      name={`item${index}`}
      placeholder={t("question")}
      className="w-full"
      value={value}
      describedBy={describedById ?? undefined}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateValue(index, e.target.value)}
      theme="title"
      {...getLocalizationAttribute()}
    />
  );
};
