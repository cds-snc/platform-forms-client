export const PublishIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    width="24"
    className={className}
    viewBox="0 0 24 24"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="m10.523 16.55 7.079-7.073-1.153-1.125-5.926 5.921-3-3-1.125 1.125ZM12 22a9.63 9.63 0 0 1-3.875-.79 10.123 10.123 0 0 1-3.188-2.148 10.123 10.123 0 0 1-2.148-3.187A9.63 9.63 0 0 1 2 12c0-1.383.262-2.684.79-3.898a9.898 9.898 0 0 1 2.147-3.176 10.224 10.224 0 0 1 3.188-2.137A9.63 9.63 0 0 1 12 2c1.383 0 2.684.262 3.898.79a9.994 9.994 0 0 1 3.176 2.136 9.994 9.994 0 0 1 2.137 3.176A9.687 9.687 0 0 1 22 12a9.63 9.63 0 0 1-.79 3.875 10.224 10.224 0 0 1-2.136 3.188 9.898 9.898 0 0 1-3.176 2.148A9.687 9.687 0 0 1 12 22Zm0-1.5c2.367 0 4.375-.828 6.023-2.488C19.676 16.355 20.5 14.352 20.5 12c0-2.367-.824-4.375-2.477-6.023C16.375 4.324 14.367 3.5 12 3.5c-2.352 0-4.355.824-6.012 2.477C4.328 7.625 3.5 9.633 3.5 12c0 2.352.828 4.355 2.488 6.012C7.645 19.672 9.648 20.5 12 20.5Zm0-8.5Zm0 0" />
  </svg>
);
