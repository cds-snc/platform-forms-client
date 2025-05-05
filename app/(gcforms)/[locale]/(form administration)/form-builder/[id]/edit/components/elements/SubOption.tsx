"use client";
import React, { useRef, useEffect, ReactElement, useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";
import debounce from "lodash.debounce";

import { type Language } from "@lib/types/form-builder-types";

import { Close } from "@serverComponents/icons";
import { Button } from "@clientComponents/globals";
import { Input } from "@formBuilder/components/shared/Input";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { cn } from "@lib/utils";

type RenderIcon = (index: number) => ReactElement | string | undefined;

export const SubOption = ({
  subIndex,
  index,
  id,
  renderIcon,
  initialValue,
}: {
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
    setChangeKey,
    getFormElementIndexes,
  } = useTemplateStore((s) => ({
    addSubChoice: s.addSubChoice,
    removeSubChoice: s.removeSubChoice,
    updateField: s.updateField,
    setFocusInput: s.setFocusInput,
    getFocusInput: s.getFocusInput,
    translationLanguagePriority: s.translationLanguagePriority,
    getLocalizationAttribute: s.getLocalizationAttribute,
    setChangeKey: s.setChangeKey,
    getFormElementIndexes: s.getFormElementIndexes,
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
      addSubChoice(id, subIndex);
      setChangeKey(String(new Date().getTime()));
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

  // Ensure we have the correct (latest) indexes
  const indexes = getFormElementIndexes(id);

  if (indexes.length < 1) return null;

  return (
    <div className="mt-3 flex" data-id={id}>
      {icon && <div className="mt-2 flex w-5 justify-end">{icon}</div>}

      <Input
        id={`option--${id}--${index + 1}`}
        ref={input}
        type="text"
        value={value}
        placeholder={`${t("option")} ${index + 1}`}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          updateValue(Number(indexes[0]), subIndex, index, e.target.value);
        }}
        onKeyDown={handleKeyDown}
        className={cn("!my-0 max-h-9 w-full", icon && "ml-5")}
        {...getLocalizationAttribute()}
      />
      <Button
        theme="icon"
        className="group"
        id={`remove--${id}--${index + 1}`}
        icon={
          <Close className="bg-gray-selected hover:bg-gray-600 group-focus:fill-white-default" />
        }
        aria-label={`${t("removeOption")} ${value}`}
        onClick={() => {
          removeSubChoice(id, subIndex, index);
          setChangeKey(String(new Date().getTime()));
        }}
      ></Button>
    </div>
  );
};
