import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { RichTextEditor } from "../plate-editor/RichTextEditor";
import { serialize } from "remark-slate";
import { initialText } from "../plate-editor/examples/initialText";

const OptionWrapper = styled.div`
  display: flex;
`;

export const RichText = ({ parentIndex }: { parentIndex: number }) => {
  const input = useRef<HTMLInputElement>(null);
  const { updateField, form } = useTemplateStore();

  // need to convert markdown back to json
  // const newValue = elements[parentIndex].properties.descriptionEn
  //   ? elements[parentIndex].properties.descriptionEn
  //   : initialValue;

  const [value, setValue] = useState(
    form.elements[parentIndex].properties.descriptionEn
      ? form.elements[parentIndex].properties.descriptionEn
      : initialText
  );

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);

  const handleChange = (value) => {
    // const parsed = JSON.parse(value);
    const serialized = serialize({ children: value });

    // logMessage.info(serialized);
    // logMessage.info(deserialize(serialized));

    setValue(value);
    updateField(`form.elements[${parentIndex}].properties.descriptionEn`, serialized);

    // const parsed = JSON.parse(value);
    // const serialized = serialize(parsed);
    // const serialized = serialize({ children: value });
    // const serialized = parsed.map((v) => serialize(v)).join("");

    // logMessage.info(serialized);
    // setValue(value);
    // updateField(
    //   `form.elements[${parentIndex}].properties.descriptionEn`,
    //   serialized ? serialized : false
    // );
  };

  return (
    <OptionWrapper>
      <RichTextEditor value={value} onChange={handleChange} />
    </OptionWrapper>
  );
};

RichText.propTypes = {
  parentIndex: PropTypes.number,
  index: PropTypes.number,
  renderIcon: PropTypes.func,
};
