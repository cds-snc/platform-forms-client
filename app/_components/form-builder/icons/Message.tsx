import React from "react";
export const MessageIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    width="24"
    className={className}
    viewBox="0 96 960 960"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="M440 656h80V536h120v-80H520V336h-80v120H320v80h120v120ZM80 976V256q0-33 23.5-56.5T160 176h640q33 0 56.5 23.5T880 256v480q0 33-23.5 56.5T800 816H240L80 976Zm80-193 47-47h593V256H160v527Zm0-527v527-527Z" />
  </svg>
);
