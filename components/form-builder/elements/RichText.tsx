import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { RichTextEditor } from "../editor/RichTextEditor";

const OptionWrapper = styled.div`
  display: flex;
`;

export const RichText = ({ parentIndex }: { parentIndex: number }) => {
  const input = useRef<HTMLInputElement>(null);
  const {
    form: { elements },
    updateField,
    resetChoices,
  } = useTemplateStore();
  const val = elements[parentIndex].properties.descriptionEn;

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);

  /*
  updateField(`form.elements[${parentIndex}].properties.descriptionEn`, e.target.value);
  // for rich text fields we want to clear the choices array
  resetChoices(parentIndex);
  */

  return (
    <OptionWrapper>
      <RichTextEditor />
    </OptionWrapper>
  );
};

RichText.propTypes = {
  parentIndex: PropTypes.number,
  index: PropTypes.number,
  renderIcon: PropTypes.func,
};
