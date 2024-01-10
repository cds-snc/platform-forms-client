import React from "react";
export const SavedCheckIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="10"
    className={className}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path fill="#64748B" d="m4 9.4-4-4L1.4 4 4 6.6 10.6 0 12 1.4l-8 8Z" />
  </svg>
);
