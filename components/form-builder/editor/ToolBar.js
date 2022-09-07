import React from "react";
import { useSlate } from "slate-react";
import { toggleMark, toggleBlock } from "./util";
import styled from "styled-components";
import { BulletedListIcon } from "../icons/BulletedListIcon";

export const StyledToolbar = styled.div`
  background-color: #ccc;
  padding: 5px 10px;
  display: flex;

  & button {
    margin 0 8px;
    font-size: .8em;
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
        <strong>B</strong>
      </button>

      <button
        onClick={() => {
          toggleMark(editor, "italic");
        }}
      >
        <i>I</i>
      </button>

      <button
        onClick={() => {
          toggleBlock(editor, "heading-two");
        }}
      >
        H2
      </button>

      <button
        onClick={() => {
          toggleBlock(editor, "bulleted-list");
        }}
      >
        <BulletedListIcon />
      </button>
    </StyledToolbar>
  );
};
