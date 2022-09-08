import React from "react";
import { useSlate } from "slate-react";
import { toggleMark, toggleBlock } from "./util";
import styled from "styled-components";
import { BulletedListIcon, NumberedListIcon } from "../icons";

export const StyledToolbar = styled.div`
  background-color: #ebebeb;
  padding: 5px 10px;
  display: flex;
  height: 44px;

  & button {
    margin 0 8px;
    font-size: .8em;
  }

  & button.underline {
    text-decoration: underline;
  }
`;

export const Toolbar = () => {
  const editor = useSlate();
  return (
    <StyledToolbar>
      <button
        onClick={() => {
          toggleBlock(editor, "heading-two");
        }}
      >
        H2
      </button>

      <button
        onClick={() => {
          toggleBlock(editor, "heading-three");
        }}
      >
        H3
      </button>

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
        className="underline"
        onClick={() => {
          toggleMark(editor, "underline");
        }}
      >
        U
      </button>

      <button
        onClick={() => {
          toggleBlock(editor, "bulleted-list");
        }}
      >
        <BulletedListIcon />
      </button>

      <button
        onClick={() => {
          toggleBlock(editor, "numbered-list");
        }}
      >
        <NumberedListIcon />
      </button>
    </StyledToolbar>
  );
};
