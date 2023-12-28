import React from "react";
export const MenuOpenIcon = ({ className, title }: { className?: string; title?: string }) => (
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
    <path d="M3 18v-1.5h13V18Zm16.95-1.3-4.723-4.723 4.699-4.704L21 8.352l-3.625 3.625 3.648 3.648ZM3 12.7v-1.5h10v1.5Zm0-5.2V6h13v1.5Zm0 0" />
  </svg>
);
