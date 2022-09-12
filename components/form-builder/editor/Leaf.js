import React from "react";
import PropTypes from "prop-types";

export const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

Leaf.propTypes = {
  attributes: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  leaf: PropTypes.object,
};
