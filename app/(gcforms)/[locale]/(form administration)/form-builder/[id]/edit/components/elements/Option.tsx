"use client";
import React, { useRef, useEffect, ReactElement, useCallback, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "@i18n/client";
import debounce from "lodash.debounce";

import { Close } from "@serverComponents/icons";
import { Button } from "@clientComponents/globals";
import { Input } from "@formBuilder/components/shared/Input";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Language } from "@lib/types/form-builder-types";

type RenderIcon = (index: number) => ReactElement | string | undefined;

export const Option = ({
  parentIndex,
  index,
  id,
  renderIcon,
  initialValue,
  onFocus,
  onBlur,
}: {
  parentIndex: number;
  index: number;
  id: number;
  renderIcon?: RenderIcon;
  initialValue: string;
  onFocus?: () => void;
  onBlur?: () => void;
}) => {
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
      <div className="mt-2 flex w-5 justify-end" role="presentation">
        {icon}
      </div>
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
        className="!my-0 ml-5 max-h-9 w-full"
        {...getLocalizationAttribute()}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <Button
        theme="icon"
        className="group bg-gray-selected hover:bg-gray-600"
        id={`remove--${id}--${index + 1}`}
        icon={<Close className="group-focus:fill-white-default" />}
        aria-label={`${t("removeOption")} ${value}`}
        onClick={() => {
          cleanUpRules(String(id), index);
          removeChoice(parentIndex, index);
        }}
      ></Button>
    </div>
  );
};

Option.propTypes = {
  parentIndex: PropTypes.number,
  index: PropTypes.number,
  renderIcon: PropTypes.func,
};
