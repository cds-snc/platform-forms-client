import React from "react";
export const RoundThinXCloseIcon = ({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="36"
    height="37"
    viewBox="0 0 36 37"
    className={className}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <circle cx="18" cy="18.5" r="18" fill="#E2E8EF" />
    <rect
      x="24.7463"
      y="11.5"
      width="1.3884"
      height="19.4377"
      transform="rotate(45 24.7463 11.5)"
      fill="black"
    />
    <rect
      x="25.7263"
      y="25.2446"
      width="1.3884"
      height="19.4377"
      transform="rotate(135 25.7263 25.2446)"
      fill="black"
    />
  </svg>
);
