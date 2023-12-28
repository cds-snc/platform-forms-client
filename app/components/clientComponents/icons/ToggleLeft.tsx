import React from "react";
export const ToggleLeft = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="80"
    height="48"
    viewBox="0 0 80 48"
    className={className}
    fill="none"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    <rect width="80" height="48" rx="24" />
    <circle cx="24" cy="24" r="22" fill="white" />
  </svg>
);
