import React from "react";
export const FlowPlusIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="39"
    width="39"
    className={className}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <rect width={39} height={39} fill="#6366F1" rx={19.5} />
    <path
      stroke="#EEF2FF"
      strokeLinecap="round"
      strokeWidth={2.5}
      d="M19.25 10.25v18.5M10.25 19.75h18.5"
    />
  </svg>
);
