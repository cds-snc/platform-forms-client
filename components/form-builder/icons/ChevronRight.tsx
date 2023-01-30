import React from "react";
export const ChevronRight = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="10"
    height="16"
    className={className}
    viewBox="0 0 10 16"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
    fill="none"
  >
    {title && <title>{title}</title>}
    <path d="M1.5 1L8.5 8.5L1.5 14.5" stroke="#26374A" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
