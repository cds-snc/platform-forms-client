import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { RichTextEditor } from "../plate-editor/RichTextEditor";
import { deserializeMd, Value } from "@udecode/plate";
import { useMyPlateEditorRef } from "../plate-editor/types";
import { serializeMd } from "../plate-editor/helpers/markdown";
import { LocalizedElementProperties } from "../types";

const OptionWrapper = styled.div`
  display: flex;
`;

export const RichText = ({ parentIndex }: { parentIndex: number }) => {
  const input = useRef<HTMLInputElement>(null);
  const editorId = `${parentIndex}-editor`;
  const editor = useMyPlateEditorRef(editorId);

  const { localizeField, updateField, form } = useTemplateStore();

  const [value, setValue] = useState(
    form.elements[parentIndex].properties.descriptionEn
      ? deserializeMd(
          editor,
          form.elements[parentIndex].properties[
            localizeField(LocalizedElementProperties.DESCRIPTION)
          ]
        )
      : ""
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
  const handleChange = (value: Value) => {
    let serialized = serializeMd(value);

    if (typeof serialized === "undefined") {
      serialized = "";
    }

    setValue(value);
    updateField(
      `form.elements[${parentIndex}].properties.${localizeField(
        LocalizedElementProperties.DESCRIPTION
      )}`,
      serialized
    );
  };

  return (
    <OptionWrapper>
      <RichTextEditor id={editorId} value={value} onChange={handleChange} />
    </OptionWrapper>
  );
};

RichText.propTypes = {
  parentIndex: PropTypes.number,
  index: PropTypes.number,
  renderIcon: PropTypes.func,
};
