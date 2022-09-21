import React from "react";
import { createPlugins, Plate } from "@udecode/plate-core";
import { editableProps } from "./editableProps";
import { MyValue } from "./types";
import PropTypes from "prop-types";
import { createBoldPlugin, createItalicPlugin } from "@udecode/plate-basic-marks";
import { createHeadingPlugin } from "@udecode/plate-heading";
import { createParagraphPlugin } from "@udecode/plate-paragraph";
import { createBlockquotePlugin } from "@udecode/plate-block-quote";
import { plateUI } from "./plateUI";

const plugins = createPlugins<MyValue>(
  [
    createBoldPlugin(),
    createItalicPlugin(),
    createHeadingPlugin(),
    createParagraphPlugin(),
    createBlockquotePlugin(),
  ],
  {
    components: plateUI,
  }
);

export const RichTextEditor = ({ value, onChange }) => {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      initialValue={value}
      plugins={plugins}
      onChange={(value) => {
        onChange(JSON.stringify(value));
      }}
    />
  );
};

RichTextEditor.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func,
};
