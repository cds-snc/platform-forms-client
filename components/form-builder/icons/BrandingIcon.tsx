import React from "react";
export const BrandingIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="33"
    height="27"
    viewBox="0 0 33 27"
    className={className}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
    data-testid="InfoIcon"
  >
    {title && <title>{title}</title>}
    <path
      d="M13.5 21.5733H27.94V11.2533H13.5V21.5733ZM2.9 26.1333C2.26 26.1333 1.7 25.8933 1.22 25.4133C0.74 24.9333 0.5 24.3733 0.5 23.7333V2.93333C0.5 2.29333 0.74 1.73333 1.22 1.25333C1.7 0.773325 2.26 0.533325 2.9 0.533325H30.1C30.74 0.533325 31.3 0.773325 31.78 1.25333C32.26 1.73333 32.5 2.29333 32.5 2.93333V23.7333C32.5 24.3733 32.26 24.9333 31.78 25.4133C31.3 25.8933 30.74 26.1333 30.1 26.1333H2.9ZM2.9 23.7333H30.1V2.93333H2.9V23.7333Z"
      fill="#1E293B"
    />
  </svg>
);
