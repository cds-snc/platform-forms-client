"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";
import debounce from "lodash.debounce";

import { ExpandingInput } from "@clientComponents/form-builder/app/shared";
import { Language } from "@clientComponents/form-builder/types";
import { useTemplateStore } from "@clientComponents/form-builder/store";
import { useRefsContext } from "@clientComponents/form-builder/app/edit/RefsContext";
import { cleanInput } from "@clientComponents/form-builder/util";

export const QuestionInput = ({
  index,
  id,
  initialValue,
  onQuestionChange,
  describedById,
}: {
  index: number;
  id: number;
  initialValue: string;
  onQuestionChange: (itemId: number, val: string, lang: Language) => void;
  describedById?: string;
}) => {
  const { t } = useTranslation("form-builder");
  const [value, setValue] = useState(initialValue);

  const { refs } = useRefsContext();
  const getRef = (element: HTMLTextAreaElement) => {
    if (!refs || !refs.current || !element || !id) {
      return;
    }

    return (refs.current[id] = element);
  };

  const { getFocusInput, setFocusInput, translationLanguagePriority, getLocalizationAttribute } =
    useTemplateStore((s) => ({
      setFocusInput: s.setFocusInput,
      getFocusInput: s.getFocusInput,
      translationLanguagePriority: s.translationLanguagePriority,
      getLocalizationAttribute: s.getLocalizationAttribute,
    }));

  useEffect(() => {
    // see: https://github.com/cds-snc/platform-forms-client/pull/1194/commits/cf2d08676cb9dfa7bb500f713cc16cdf653c3e93
    if (refs && refs.current && getFocusInput()) {
      refs.current[id].focus();
      setFocusInput(false);
    }
  }, [getFocusInput, setFocusInput, id, refs]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const _debounced = debounce(
    useCallback(
      (id: number, value: string, lang: Language) => {
        onQuestionChange(id, value, lang);
      },
      [onQuestionChange]
    ),
    100
  );

  const updateValue = useCallback(
    (id: number, value: string) => {
      setValue(value);
      _debounced(id, value, translationLanguagePriority);
    },
    // exclude _debounced from the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setValue, translationLanguagePriority]
  );

  return (
    <ExpandingInput
      ref={getRef}
      type="text"
      id={`item-${id}`}
      name={`item${index}`}
      placeholder={t("question")}
      wrapperClassName="w-full font-bold text-base"
      className="font-bold text-slate-800 laptop:text-lg"
      value={value}
      describedBy={describedById ?? undefined}
      onBlur={() => {
        updateValue(id, cleanInput(value));
      }}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateValue(id, e.target.value)}
      {...getLocalizationAttribute()}
    />
  );
};
