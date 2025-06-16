"use client";
import React, { useRef, useEffect, ReactElement, useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";
import debounce from "lodash.debounce";

import { Close } from "@serverComponents/icons";
import { Button } from "@clientComponents/globals";
import { Input } from "@formBuilder/components/shared/Input";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Language } from "@lib/types/form-builder-types";
import { cn } from "@lib/utils";

type RenderIcon = ((index: number) => ReactElement | string) | undefined;

interface OptionProps {
  parentIndex: number;
  index: number;
  renderIcon?: RenderIcon;
  initialValue: string;
  onFocus?: () => void;
  onBlur?: () => void;
  id: number;
}

export const Option = ({
  parentIndex,
  index,
  id,
  renderIcon,
  initialValue,
  onFocus,
  onBlur,
}: OptionProps) => {
  const input = useRef<HTMLInputElement>(null);

  const {
    addChoice,
    removeChoice,
    updateField,
    getFocusInput,
    setFocusInput,
    translationLanguagePriority,
    getLocalizationAttribute,
    removeChoiceFromRules,
    removeChoiceFromNextActions,
  } = useTemplateStore((s) => ({
    addChoice: s.addChoice,
    removeChoice: s.removeChoice,
    updateField: s.updateField,
    setFocusInput: s.setFocusInput,
    getFocusInput: s.getFocusInput,
    translationLanguagePriority: s.translationLanguagePriority,
    getLocalizationAttribute: s.getLocalizationAttribute,
    removeChoiceFromRules: s.removeChoiceFromRules,
    removeChoiceFromNextActions: s.removeChoiceFromNextActions,
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
      addChoice(parentIndex);
    }
  };

  const _debounced = debounce(
    useCallback(
      (parentIndex: number, value: string, lang: Language) => {
        updateField(`form.elements[${parentIndex}].properties.choices[${index}].${lang}`, value);
      },
      [updateField, index]
    ),
    100
  );

  const updateValue = useCallback(
    (parentIndex: number, value: string) => {
      setValue(value);
      _debounced(parentIndex, value, translationLanguagePriority);
    },

    // exclude _debounced from the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setValue, translationLanguagePriority]
  );

  const cleanUpRules = useCallback(
    (parentId: string, index: number) => {
      removeChoiceFromRules(parentId, index);
      removeChoiceFromNextActions(parentId, index);
    },
    [removeChoiceFromRules, removeChoiceFromNextActions]
  );

  return (
    <div className="mt-3 flex">
      {icon && (
        <div className="mt-2 flex w-5 justify-end" role="presentation">
          {icon}
        </div>
      )}
      <Input
        id={`option--${id}--${index + 1}`}
        ref={input}
        type="text"
        value={value}
        placeholder={`${t("option")} ${index + 1}`}
        ariaLabel={`${t("option")} ${index + 1}`}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          updateValue(parentIndex, e.target.value)
        }
        onKeyDown={handleKeyDown}
        className={cn("!my-0 max-h-9 w-full", icon && "ml-5")}
        {...getLocalizationAttribute()}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <Button
        className="ml-2 flex max-h-9 max-w-9 items-center justify-center !rounded-full border-1 border-slate-800 bg-gray-selected !p-1.5 text-center  [&_svg]:hover:fill-white [&_svg]:focus:fill-white"
        id={`remove--${id}--${index + 1}`}
        icon={<Close className="ml-[12px]" />}
        aria-label={`${t("removeOption")} ${value}`}
        onClick={() => {
          cleanUpRules(String(id), index);
          removeChoice(parentIndex, index);
        }}
      ></Button>
    </div>
  );
};
