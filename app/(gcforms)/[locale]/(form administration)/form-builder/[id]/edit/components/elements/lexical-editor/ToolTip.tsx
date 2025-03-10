"use client";
import React, { useId, Children } from "react";

export const ToolTip = ({ children, text }: { children: React.ReactElement; text: string }) => {
  const id = `tooltip-${useId()}`;

  return (
    <span className="relative">
      {Children.map(children, (child) => {
        return React.cloneElement(child, {
          // @ts-expect-error  -- TODO: fix this
          ...child.props,
          // @ts-expect-error  -- TODO: fix this
          className: child.props.className + " peer",
          "aria-labelledby": id,
        });
      })}
      <span
        id={id}
        className={`invisible ontop absolute -left-14 -top-10 w-36 whitespace-nowrap rounded bg-gray-800 p-1 text-center text-sm text-white after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-gray-700 after:content-[''] peer-hover:visible peer-focus:visible`}
      >
        {text}
      </span>
    </span>
  );
};
