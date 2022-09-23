import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { RichTextEditor } from "../plate-editor/RichTextEditor";
import { initialText } from "../plate-editor/examples/initialText";
import { deserializeMd } from "@udecode/plate";
import { useMyPlateEditorRef } from "../plate-editor/types";
import { serializeMd } from "../plate-editor/helpers/markdown";

const OptionWrapper = styled.div`
  display: flex;
`;

export const RichText = ({ parentIndex }: { parentIndex: number }) => {
  const input = useRef<HTMLInputElement>(null);
  const { updateField, form } = useTemplateStore();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const editor = useMyPlateEditorRef()!;

  const [value, setValue] = useState(
    form.elements[parentIndex].properties.descriptionEn
      ? deserializeMd(editor, form.elements[parentIndex].properties.descriptionEn)
      : initialText
  );

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);

  /**
   * Serialize the contents of the Editor to Markdown and save
   * to the datastore.
   *
   * @param value
   */
  const handleChange = (value) => {
    const serialized = serializeMd(value);

    setValue(value);
    updateField(`form.elements[${parentIndex}].properties.descriptionEn`, serialized);
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
