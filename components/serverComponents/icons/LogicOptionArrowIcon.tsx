export const LogicOptionArrowIcon = ({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={34} height={34} fill="none" className={className}>
    {title && <title>{title}</title>}
    <rect width={33} height={33} x={0.5} y={0.5} fill="#ECFDF5" rx={16.5} />
    <rect width={33} height={33} x={0.5} y={0.5} stroke="#047857" rx={16.5} />
    <path
      fill="#1E293B"
      d="M10 10v9c0 .55.196 1.02.588 1.413.391.391.862.587 1.412.587h8.2l-1.6 1.6L20 24l4-4-4-4-1.4 1.4 1.6 1.6H12v-9h-2Z"
    />
  </svg>
);
