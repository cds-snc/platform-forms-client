import React from "react";
export const Duplicate = ({ className, title }: { className?: string; title?: string }) => (
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
    <path d="M4.5 21.977c-.398 0-.75-.153-1.05-.454-.302-.296-.45-.648-.45-1.046V5.398h1.5v15.079h11.852v1.5Zm3-3c-.398 0-.75-.153-1.05-.454-.302-.296-.45-.648-.45-1.046v-14c0-.403.148-.75.45-1.051.3-.301.652-.45 1.05-.45h11c.398 0 .75.149 1.05.45.302.3.45.648.45 1.05v14c0 .399-.148.75-.45 1.047-.3.301-.652.454-1.05.454Zm0-1.5h11v-14h-11Zm0 0v-14Zm0 0" />
  </svg>
);
