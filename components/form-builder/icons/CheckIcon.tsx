import React from "react";
export const CheckIcon = ({
  className,
  title,
  isFillInherit = false,
  width,
}: {
  className?: string;
  title?: string;
  isFillInherit?: boolean;
  width?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={width ? "auto" : "18"}
    width={width ? width : "18"}
    className={className}
    viewBox="0 0 18 18"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
    fill="none"
  >
    {title && <title>{title}</title>}
    <path
      d="M16 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM7 14 2 9l1.41-1.41L7 11.17l7.59-7.59L16 5l-9 9Z"
      fill={isFillInherit ? "currentColor" : "#5F6368"}
    />
  </svg>
);
