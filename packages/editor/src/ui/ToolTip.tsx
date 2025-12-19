"use client";
import React, { useId, Children } from "react";
import "./ToolTip.css";

export const ToolTip = ({
  children,
  text,
  element = null,
}: {
  children: React.ReactElement;
  text: string;
  element?: React.JSX.Element | null;
}) => {
  const id = `tooltip-${useId()}`;

  return (
    <span className="gc-tooltip-container">
      {Children.map(children, (child) => {
        return React.cloneElement(child, {
          // @ts-expect-error  -- TODO: fix this
          ...child.props,
          // @ts-expect-error  -- TODO: fix this
          className: child.props.className + " gc-tooltip-target",
          "aria-labelledby": id,
        });
      })}
      <span id={id} className="gc-tooltip">
        {text}
        {element}
      </span>
    </span>
  );
};
