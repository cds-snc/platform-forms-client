import React, { useRef, useEffect, ReactElement } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Close } from "../icons";
import { Button } from "../panel";
import useTemplateStore from "../store/useTemplateStore";

const OptionWrapper = styled.div`
  display: flex;
  margin-top: 10px;

  &:first-of-type {
    margin-top: 20px;
  }
`;

const IconWrapper = styled.div`
  margin-top: 10px;
`;

const TextInput = styled.input`
  font-size: 16px;
  margin-left: 20px;
  padding: 20px;
  width: 340px;
  border: 1.5px solid #000000;
  border-radius: 4px;
  height: 24px;

  &:focus {
    border-color: #303fc3;
    box-shadow: 0 0 0 2.5px #303fc3;
    outline: 0;
  }
`;

const RemoveButton = styled(Button)`
  max-height: none;
  margin: 0;
  padding: 10px;
  border-radius: 50%;
  margin-left: 5px;
  background-color: #ebebeb;

  svg {
    fill: #000000;
    margin: 0;
  }
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
  const {
    form: { elements },
    removeChoice,
    updateField,
    lang,
  } = useTemplateStore();
  const val = elements[parentIndex].properties.choices[index][lang];
  const icon = renderIcon && renderIcon(index);

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);

  return (
    <OptionWrapper>
      <IconWrapper>{icon}</IconWrapper>
      <TextInput
        ref={input}
        type="text"
        value={val}
        placeholder={`Option ${index + 1}`}
        onChange={(e) => {
          updateField(
            `form.elements[${parentIndex}].properties.choices[${index}].${lang}`,
            e.target.value
          );
        }}
      />
      <RemoveButton
        icon={<Close />}
        aria-label={`Remove ${val}`}
        onClick={() => {
          removeChoice(parentIndex, index);
        }}
      ></RemoveButton>
    </OptionWrapper>
  );
};

Option.propTypes = {
  parentIndex: PropTypes.number,
  index: PropTypes.number,
  renderIcon: PropTypes.func,
};
