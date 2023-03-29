import React from "react";
export const WarningIcon = ({
  className,
  title,
  width,
}: {
  className?: string;
  title?: string;
  width?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={width ? "auto" : "38"}
    width={width ? width : "32"}
    className={className}
    viewBox="0 0 38 32"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="M0.667969 32L19.0013 0.333374L37.3346 32H0.667969ZM5.0013 29.5H33.0013L19.0013 5.33337L5.0013 29.5ZM19.168 27.125C19.5291 27.125 19.8277 27.007 20.0638 26.7709C20.2999 26.5348 20.418 26.2362 20.418 25.875C20.418 25.5139 20.2999 25.2153 20.0638 24.9792C19.8277 24.7431 19.5291 24.625 19.168 24.625C18.8069 24.625 18.5082 24.7431 18.2721 24.9792C18.036 25.2153 17.918 25.5139 17.918 25.875C17.918 26.2362 18.036 26.5348 18.2721 26.7709C18.5082 27.007 18.8069 27.125 19.168 27.125ZM17.918 22.5H20.418V13.1667H17.918V22.5Z" />
  </svg>
);
