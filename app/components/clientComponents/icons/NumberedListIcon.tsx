import React from "react";
export const NumberedListIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="20"
    width="20"
    className={className}
    viewBox="0 0 20 20"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="M3 20v-1h2v-.5H4v-1h1V17H3v-1h3v4Zm5-1v-2h13v2Zm-5-5v-.9L4.8 11H3v-1h3v.9L4.2 13H6v1Zm5-1v-2h13v2ZM4 8V5H3V4h2v4Zm4-1V5h13v2Z" />
  </svg>
);
