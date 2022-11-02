import React, { useRef, useEffect, ReactElement } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Close } from "../icons";
import { Button } from "../shared/Button";
import { Input } from "../panel";
import { useTemplateStore } from "../store/useTemplateStore";
import { useTranslation } from "next-i18next";

const TextInput = styled(Input)`
  margin-left: 20px;
  padding: 16px 10px;
  width: 340px;
`;

type RenderIcon = (index: number) => ReactElement | string | undefined;

export const Option = ({
  parentIndex,
  index,
  renderIcon,
}: {
  parentIndex: number;
  index: number;
  renderIcon?: RenderIcon;
}) => {
  const input = useRef<HTMLInputElement>(null);

  const { elements, addChoice, removeChoice, updateField, lang, getFocusInput, setFocusInput } =
    useTemplateStore((s) => ({
      elements: s.form.elements,
      addChoice: s.addChoice,
      removeChoice: s.removeChoice,
      updateField: s.updateField,
      lang: s.lang,
      focusInput: s.focusInput,
      setFocusInput: s.setFocusInput,
      getFocusInput: s.getFocusInput,
    }));

  const val = elements[parentIndex].properties.choices[index][lang];
  const icon = renderIcon && renderIcon(index);
  const { t } = useTranslation("form-builder");

  useEffect(() => {
    // see: https://github.com/cds-snc/platform-forms-client/pull/1194/commits/cf2d08676cb9dfa7bb500f713cc16cdf653c3e93
    if (input.current && getFocusInput()) {
      input.current.focus();
      setFocusInput(false);
    }
  }, [getFocusInput]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter") {
      setFocusInput(true);
      addChoice(parentIndex);
    }
  };

  return (
    <div className="flex mt-3">
      <div className="mt-2">{icon}</div>
      <TextInput
        ref={input}
        type="text"
        value={val}
        placeholder={`${t("option")} ${index + 1}`}
        onChange={(e) => {
          updateField(
            `form.elements[${parentIndex}].properties.choices[${index}].${lang}`,
            e.target.value
          );
        }}
        onKeyDown={handleKeyDown}
      />
      <Button
        theme="icon"
        className="group"
        icon={<Close className="group-focus:fill-white-default" />}
        aria-label={`${t("removeOption")} ${val}`}
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
