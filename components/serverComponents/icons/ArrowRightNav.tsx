export const ArrowRightNav = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    width="13"
    height="24"
    viewBox="0 0 13 24"
    xmlns="http://www.w3.org/2000/svg"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
    className={className}
  >
    {title && <title>{title}</title>}
    <path
      d="M4 21.25C3.64844 21.25 3.33594 21.1328 3.10156 20.8984C2.59375 20.4297 2.59375 19.6094 3.10156 19.1406L9.70312 12.5L3.10156 5.89844C2.59375 5.42969 2.59375 4.60938 3.10156 4.14062C3.57031 3.63281 4.39062 3.63281 4.85938 4.14062L12.3594 11.6406C12.8672 12.1094 12.8672 12.9297 12.3594 13.3984L4.85938 20.8984C4.625 21.1328 4.3125 21.25 4 21.25Z"
      fill="white"
    />
  </svg>
);
