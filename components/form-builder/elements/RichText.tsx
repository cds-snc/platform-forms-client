import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { RichTextEditor } from "../plate-editor/RichTextEditor";
import { initialValue } from "../plate-editor/util";
import { serialize } from "../editor/Markdown";

const OptionWrapper = styled.div`
  display: flex;
`;

export const RichText = ({ parentIndex }: { parentIndex: number }) => {
  const input = useRef<HTMLInputElement>(null);
  const { updateField } = useTemplateStore();

  // need to convert markdown back to json
  // const newValue = elements[parentIndex].properties.descriptionEn
  //   ? elements[parentIndex].properties.descriptionEn
  //   : initialValue;

  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);

  const saveValue = (value: string) => {
    const parsed = JSON.parse(value);
    const serialized = serialize({ children: parsed });

    setValue(parsed);
    updateField(`form.elements[${parentIndex}].properties.descriptionEn`, serialized);
  };

  return (
    <OptionWrapper>
      <RichTextEditor value={value} onChange={saveValue} />
    </OptionWrapper>
  );
};

RichText.propTypes = {
  parentIndex: PropTypes.number,
  index: PropTypes.number,
  renderIcon: PropTypes.func,
};
