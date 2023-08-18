import React from "react";
export const WarningIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    width="24"
    className={className}
    viewBox="0 96 960 960"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
    data-testid="WarningIcon"
    // TODO: consider but probably better to be intentional and use a fill-[COLOR]
    // fill="currentColor"
  >
    {title && <title>{title}</title>}
    <path d="m40 936 440-760 440 760H40Zm138-80h604L480 336 178 856Zm302-40q17 0 28.5-11.5T520 776q0-17-11.5-28.5T480 736q-17 0-28.5 11.5T440 776q0 17 11.5 28.5T480 816Zm-40-120h80V496h-80v200Zm40-100Z" />
  </svg>
);
