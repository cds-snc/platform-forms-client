export const BrandingIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={20}
    className={className}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
    data-testid="InfoIcon"
  >
    {title && <title>{title}</title>}
    <path
      fill="#1E293B"
      d="M10.25 16.18h10.83V8.44H10.25v7.74ZM2.3 19.6c-.48 0-.9-.18-1.26-.54C.68 18.7.5 18.28.5 17.8V2.2c0-.48.18-.9.54-1.26C1.4.58 1.82.4 2.3.4h20.4c.48 0 .9.18 1.26.54.36.36.54.78.54 1.26v15.6c0 .48-.18.9-.54 1.26-.36.36-.78.54-1.26.54H2.3Zm0-1.8h20.4V2.2H2.3v15.6Z"
    />
  </svg>
);
