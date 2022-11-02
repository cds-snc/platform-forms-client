import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { LocalizedElementProperties } from "../types";
import debounce from "lodash.debounce";
import { Input } from "./Input";

const StyledInput = styled(Input)`
  padding: 24px 10px 20px 10px;
  border: none;
  border-bottom: 1.5px solid #000000;
  border-radius: 4px 4px 0 0;
  font-weight: 700;
  font-size: 20px;

  &:focus {
    border-color: #000000;
    box-shadow: none;
    background: #ebebeb;
  }
`;

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
    focusInput: s.focusInput,
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

  const _debounced = useCallback(
    debounce((val) => {
      updateField(
        `form.elements[${index}].properties.${localizeField(LocalizedElementProperties.TITLE)}`,
        val
      );
    }, 1500),
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
    <div>
      <StyledInput
        ref={input}
        type="text"
        id={`item${index}`}
        name={`item${index}`}
        placeholder={t("Question")}
        value={value}
        aria-describedby={hasDescription ? `item${index}-describedby` : undefined}
        onChange={updateValue}
      />
    </div>
  );
};
