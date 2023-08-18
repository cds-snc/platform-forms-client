import React, { useRef, useEffect, ReactElement, useCallback, useState } from "react";
import { useTranslation } from "next-i18next";
import debounce from "lodash.debounce";

import { Close } from "../../../icons";
import { Button } from "@components/globals";
import { Input } from "../../shared/Input";
import { useTemplateStore } from "../../../store/useTemplateStore";
import { Language } from "../../../types";

type RenderIcon = (index: number) => ReactElement | string | undefined;

export const SubOption = ({
  elIndex,
  subIndex,
  index,
  id,
  renderIcon,
  initialValue,
}: {
  elIndex: number;
  subIndex: number;
  index: number;
  id: number;
  renderIcon?: RenderIcon;
  initialValue: string;
}) => {
  const input = useRef<HTMLInputElement>(null);

  const {
    addSubChoice,
    removeSubChoice,
    updateField,
    getFocusInput,
    setFocusInput,
    translationLanguagePriority,
    getLocalizationAttribute,
  } = useTemplateStore((s) => ({
    addSubChoice: s.addSubChoice,
    removeSubChoice: s.removeSubChoice,
    updateField: s.updateField,
    setFocusInput: s.setFocusInput,
    getFocusInput: s.getFocusInput,
    translationLanguagePriority: s.translationLanguagePriority,
    getLocalizationAttribute: s.getLocalizationAttribute,
  }));

  const icon = renderIcon && renderIcon(index);
  const { t } = useTranslation("form-builder");
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    // see: https://github.com/cds-snc/platform-forms-client/pull/1194/commits/cf2d08676cb9dfa7bb500f713cc16cdf653c3e93
    if (input.current && getFocusInput()) {
      input.current.focus();
      setFocusInput(false);
    }
  }, [getFocusInput, setFocusInput]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter") {
      setFocusInput(true);
      addSubChoice(elIndex, subIndex);
    }
  };

  const _debounced = debounce(
    useCallback(
      (elIndex: number, subIndex: number, choiceIndex, value: string, lang: Language) => {
        updateField(
          `form.elements[${elIndex}].properties.subElements[${subIndex}].properties.choices[${choiceIndex}].${lang}`,
          value
        );
      },
      [updateField]
    ),
    100
  );

  const updateValue = useCallback(
    (elIndex: number, subIndex: number, choiceIndex: number, value: string) => {
      setValue(value);
      _debounced(elIndex, subIndex, choiceIndex, value, translationLanguagePriority);
    },

    // exclude _debounced from the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setValue, translationLanguagePriority]
  );

  return (
    <div className="flex mt-3">
      <div className="flex mt-2 w-5 justify-end">{icon}</div>
      <Input
        id={`option--${id}--${index + 1}`}
        ref={input}
        type="text"
        value={value}
        placeholder={`${t("option")} ${index + 1}`}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          updateValue(elIndex, subIndex, index, e.target.value)
        }
        onKeyDown={handleKeyDown}
        className="ml-5 w-full max-h-9 !my-0"
        {...getLocalizationAttribute()}
      />
      <Button
        theme="icon"
        className="group"
        id={`remove--${id}--${index + 1}`}
        icon={<Close className="group-focus:fill-white-default" />}
        aria-label={`${t("removeOption")} ${value}`}
        onClick={() => {
          removeSubChoice(elIndex, subIndex, index);
        }}
      ></Button>
    </div>
  );
};
