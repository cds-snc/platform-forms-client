import React from "react";
export const ShareIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    width="24"
    className={className}
    viewBox="0 0 24 24"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="M3 20V4l19 8Zm1.5-2.324L18.102 12 4.5 6.25v4.2L10.55 12 4.5 13.5Zm0 0V6.25Zm0 0" />
  </svg>
);
