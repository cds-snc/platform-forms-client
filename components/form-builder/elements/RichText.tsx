import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { RichTextEditor } from "../editor/RichTextEditor";
import { initialValue } from "../editor/util";

const OptionWrapper = styled.div`
  display: flex;
`;

export const RichText = ({ parentIndex }: { parentIndex: number }) => {
  const input = useRef<HTMLInputElement>(null);
  const { updateField } = useTemplateStore();

  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);

  const onChange = (value: any) => {
    setValue(value);
    updateField(`form.elements[${parentIndex}].properties.descriptionEn`, JSON.stringify(value));
  };

  /*
  updateField(`form.elements[${parentIndex}].properties.descriptionEn`, e.target.value);
  // for rich text fields we want to clear the choices array
  resetChoices(parentIndex);
  */

  return (
    <OptionWrapper>
      <RichTextEditor value={value} onChange={onChange} />
    </OptionWrapper>
  );
};

RichText.propTypes = {
  parentIndex: PropTypes.number,
  index: PropTypes.number,
  renderIcon: PropTypes.func,
};
