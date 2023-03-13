import React from "react";
export const TranslateIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="20"
    width="18"
    className={className}
    viewBox="0 0 20 18"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
    fill="none"
  >
    {title && <title>{title}</title>}
    <path
      d="M9.75 2V16.5M2.7 1.75H17.3C17.8247 1.75 18.25 2.17533 18.25 2.7V15.3C18.25 15.8247 17.8247 16.25 17.3 16.25H2.7C2.17533 16.25 1.75 15.8247 1.75 15.3V2.7C1.75 2.17533 2.17533 1.75 2.7 1.75Z"
      strokeWidth="2"
    />
  </svg>
);
