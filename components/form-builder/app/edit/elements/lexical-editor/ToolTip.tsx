import React, { useId, Children } from "react";

export const ToolTip = ({ children, text }: { children: React.ReactElement; text: string }) => {
  const id = `tooltip-${useId()}`;

  return (
    <span className="relative">
      {Children.map(children, (child) => {
        return React.cloneElement(child, {
          ...child.props,
          className: child.props.className + " peer",
          "aria-labelledby": id,
        });
      })}
      <span
        id={id}
        className={`invisible whitespace-nowrap peer-hover:visible peer-focus:visible bg-gray-800 text-white rounded absolute p-1 text-sm -top-10 w-36 text-center -left-14 after:content-[''] after:absolute after:left-1/2 after:top-[100%] after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-gray-700`}
      >
        {text}
      </span>
    </span>
  );
};
