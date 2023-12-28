import React from "react";
export const QuestionsIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="19"
    width="19"
    className={className}
    viewBox="0 0 19 19"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="M1.5 17.5H2.6L13.675 6.42505L12.575 5.32505L1.5 16.4V17.5ZM16.85 5.35005L13.65 2.15005L14.7 1.10005C14.9833 0.816715 15.3333 0.675049 15.75 0.675049C16.1667 0.675049 16.5167 0.816715 16.8 1.10005L17.9 2.20005C18.1833 2.48338 18.325 2.83338 18.325 3.25005C18.325 3.66672 18.1833 4.01672 17.9 4.30005L16.85 5.35005ZM15.8 6.40005L3.2 19H0V15.8L12.6 3.20005L15.8 6.40005ZM13.125 5.87505L12.575 5.32505L13.675 6.42505L13.125 5.87505Z" />
  </svg>
);
