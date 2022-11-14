import React, { useCallback, useEffect, useRef, useState } from "react";
import { LocalizedElementProperties } from "../types";
import debounce from "lodash.debounce";
import { Input } from "../shared/Input";

import { useTemplateStore } from "../store/useTemplateStore";
import { useTranslation } from "next-i18next";

export const QuestionInput = ({
  index,
  hasDescription,
  initialValue,
}: {
  index: number;
  hasDescription: string | undefined;
  initialValue: string;
}) => {
  const { t } = useTranslation("form-builder");
  const [value, setValue] = useState(initialValue);
  const { localizeField, updateField, getFocusInput, setFocusInput } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    updateField: s.updateField,
    setFocusInput: s.setFocusInput,
    getFocusInput: s.getFocusInput,
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
    debounce((val) => {
      updateField(
        `form.elements[${index}].properties.${localizeField(LocalizedElementProperties.TITLE)}`,
        val
      );
    }, 100),
    []
  );

  const updateValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      _debounced(e.target.value);
    },
    [setValue]
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
      onChange={updateValue}
      theme="title"
    />
  );
};
