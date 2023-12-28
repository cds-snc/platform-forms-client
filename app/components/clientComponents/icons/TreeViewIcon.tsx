import React from "react";
export const TreeViewIcon = ({ className, title }: { className?: string; title?: string }) => (
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
    <path d="M15 21v-3h-4V8H9v3H2V3h7v3h6V3h7v8h-7V8h-2v8h2v-3h7v8ZM4 5v4Zm13 10v4Zm0-10v4Zm0 4h3V5h-3Zm0 10h3v-4h-3ZM4 9h3V5H4Z" />
  </svg>
);
