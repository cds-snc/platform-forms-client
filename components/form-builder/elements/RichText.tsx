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

  const onChange = (value: string) => {
    setValue(JSON.parse(value));
    updateField(`form.elements[${parentIndex}].properties.descriptionEn`, value);
  };

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
