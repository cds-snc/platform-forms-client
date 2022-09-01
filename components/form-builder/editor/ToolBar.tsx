import React from "react";
import { useSlate } from "slate-react";
import { toggleMark, toggleBlock } from "./util";
export const Toolbar = () => {
  const editor = useSlate();
  return (
    <>
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
    </>
  );
};
