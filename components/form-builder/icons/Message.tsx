import React from "react";
export const MessageIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    width="24"
    className={className}
    viewBox="0 0 34 34"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="M17 21.3333L19.3333 15.9999L24.6666 13.6666L19.3333 11.3333L17 5.99992L14.6666 11.3333L9.33331 13.6666L14.6666 15.9999L17 21.3333ZM0.333313 33.6666V2.83325C0.333313 2.19436 0.583313 1.61797 1.08331 1.10409C1.58331 0.590197 2.16665 0.333252 2.83331 0.333252H31.1666C31.8055 0.333252 32.3819 0.590197 32.8958 1.10409C33.4097 1.61797 33.6666 2.19436 33.6666 2.83325V24.4999C33.6666 25.1388 33.4097 25.7152 32.8958 26.2291C32.3819 26.743 31.8055 26.9999 31.1666 26.9999H6.99998L0.333313 33.6666ZM2.83331 27.6249L5.95831 24.4999H31.1666V2.83325H2.83331V27.6249ZM2.83331 2.83325V27.6249V2.83325Z" />
  </svg>
);
