import React, { useRef, useEffect, ReactElement, useCallback, useState } from "react";
import PropTypes from "prop-types";
import { Close } from "../../../icons";
import { Button } from "../../shared/Button";
import { Input } from "../../shared/Input";
import { useTemplateStore } from "../../../store/useTemplateStore";
import { useTranslation } from "next-i18next";
import debounce from "lodash.debounce";

type RenderIcon = (index: number) => ReactElement | string | undefined;

export const Option = ({
  parentIndex,
  index,
  renderIcon,
  initialValue,
}: {
  parentIndex: number;
  index: number;
  renderIcon?: RenderIcon;
  initialValue: string;
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
  } = useTemplateStore((s) => ({
    addChoice: s.addChoice,
    removeChoice: s.removeChoice,
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
      addChoice(parentIndex);
    }
  };

  const _debounced = useCallback(
    debounce((parentIndex, val, lang) => {
      updateField(`form.elements[${parentIndex}].properties.choices[${index}].${lang}`, val);
    }, 100),
    [translationLanguagePriority]
  );

  const updateValue = useCallback(
    (parentIndex: number, value: string) => {
      setValue(value);
      _debounced(parentIndex, value, translationLanguagePriority);
    },
    [setValue, translationLanguagePriority]
  );

  return (
    <div className="flex mt-3">
      <div className="flex mt-2 w-5 justify-end">{icon}</div>
      <Input
        id={`option--${parentIndex}--${index + 1}`}
        ref={input}
        type="text"
        value={value}
        placeholder={`${t("option")} ${index + 1}`}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          updateValue(parentIndex, e.target.value)
        }
        onKeyDown={handleKeyDown}
        className="ml-5 w-80 max-h-9 !my-0"
        {...getLocalizationAttribute()}
      />
      <Button
        theme="icon"
        className="group"
        id={`remove--${parentIndex}--${index + 1}`}
        icon={<Close className="group-focus:fill-white-default" />}
        aria-label={`${t("removeOption")} ${value}`}
        onClick={() => {
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
