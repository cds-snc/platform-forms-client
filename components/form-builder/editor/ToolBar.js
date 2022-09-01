import React from "react";
import { useSlate } from "slate-react";
import { toggleMark, toggleBlock } from "./util";
import styled from "styled-components";

export const StyledToolbar = styled.div`
  background-color: #ccc;
  padding: 10px;

  & button {
    border: 1px solid #000;
    width: 20px;
    height: 20px;
    line-height: 12px;
    font-size: 10px;
  }
`;

export const Toolbar = () => {
  const editor = useSlate();
  return (
    <StyledToolbar>
      <button
        onClick={() => {
          toggleMark(editor, "bold");
        }}
      >
        B
      </button>

      <button
        style={{ marginLeft: 10 }}
        onClick={() => {
          toggleMark(editor, "italic");
        }}
      >
        I
      </button>

      <button
        style={{ marginLeft: 10 }}
        onClick={() => {
          toggleBlock(editor, "heading-two");
        }}
      >
        H2
      </button>

      <button
        style={{ marginLeft: 10 }}
        onClick={() => {
          toggleBlock(editor, "bulleted-list");
        }}
      >
        List
      </button>
    </StyledToolbar>
  );
};
