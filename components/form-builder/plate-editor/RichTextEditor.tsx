import React from "react";
import { Plate } from "@udecode/plate-core";
import { editableProps } from "./editableProps";
import { MyValue } from "./types";
import PropTypes from "prop-types";

export const RichTextEditor = ({ value, onChange }) => {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      initialValue={value}
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
