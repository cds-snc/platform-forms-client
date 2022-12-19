import React from "react";
export const PageIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="40"
    width="40"
    className={className}
    viewBox="0 0 40 40"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="M9.16663 36.6668C8.49996 36.6668 7.91663 36.4168 7.41663 35.9168C6.91663 35.4168 6.66663 34.8335 6.66663 34.1668V5.8335C6.66663 5.16683 6.91663 4.5835 7.41663 4.0835C7.91663 3.5835 8.49996 3.3335 9.16663 3.3335H24.2083L33.3333 12.4585V34.1668C33.3333 34.8335 33.0833 35.4168 32.5833 35.9168C32.0833 36.4168 31.5 36.6668 30.8333 36.6668H9.16663ZM22.9583 13.5835V5.8335H9.16663V34.1668H30.8333V13.5835H22.9583ZM9.16663 5.8335V13.5835V5.8335V34.1668V5.8335Z" />
  </svg>
);
