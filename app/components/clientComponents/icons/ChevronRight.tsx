import React from "react";
export const ChevronRight = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="6"
    height="12"
    className={className}
    viewBox="0 0 6 12"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
    fill="none"
  >
    {title && <title>{title}</title>}
    <path d="M1.6 0.5L6 6L1.6 11.5L0.400001 10.6L4 6L0.400001 1.5L1.6 0.5Z" />
  </svg>
);
