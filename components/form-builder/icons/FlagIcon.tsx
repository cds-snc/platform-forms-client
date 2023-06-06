import React from "react";
export const FlagIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="34"
    width="34"
    viewBox="0 -960 960 960"
    className={className}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="M200-120v-680h343l19 86h238v370H544l-18.933-85H260v309h-60Zm300-452Zm95 168h145v-250H511l-19-86H260v251h316l19 85Z" />
  </svg>
);
