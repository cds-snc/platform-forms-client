import React from "react";
export const FolderIcon = ({ className, title }: { className?: string; title?: string }) => (
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
    <path d="M5.875 33.3332C5.20833 33.3332 4.625 33.0762 4.125 32.5623C3.625 32.0484 3.375 31.4721 3.375 30.8332V9.1665C3.375 8.52761 3.625 7.95123 4.125 7.43734C4.625 6.92345 5.20833 6.6665 5.875 6.6665H17.5417L20.0417 9.1665H34.2083C34.8472 9.1665 35.4236 9.42345 35.9375 9.93734C36.4514 10.4512 36.7083 11.0276 36.7083 11.6665V30.8332C36.7083 31.4721 36.4514 32.0484 35.9375 32.5623C35.4236 33.0762 34.8472 33.3332 34.2083 33.3332H5.875ZM5.875 9.1665V30.8332H34.2083V11.6665H19L16.5 9.1665H5.875ZM5.875 9.1665V30.8332V9.1665Z" />
  </svg>
);
