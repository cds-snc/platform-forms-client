export const EssentialIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    width="28"
    className={className}
    viewBox="0 0 24 28"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <rect width={24} height={28} fill="#1E293B" rx={3} />
    <path
      stroke="#EEF2FF"
      strokeWidth={2.5}
      d="M7.875 10.087C7.752 8.391 8.431 5 12.135 5c1.389.135 4.093 1.34 3.796 5.087M5.84 23h12.322C19.177 23 20 22.124 20 21.044v-9.196c0-1.08-.823-1.957-1.84-1.957H5.84c-1.017 0-1.84.876-1.84 1.957v9.196C4 22.123 4.823 23 5.84 23Z"
    />
  </svg>
);
