export const LogicSectionArrowIcon = ({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={34} height={34} fill="none" className={className}>
    {title && <title>{title}</title>}
    <rect width={33} height={33} x={0.5} y={0.5} fill="#EDE9FE" rx={16.5} />
    <rect width={33} height={33} x={0.5} y={0.5} stroke="#4338CA" rx={16.5} />
    <path fill="#020617" d="M22.175 19H10v-2h12.175l-5.6-5.6L18 10l8 8-8 8-1.425-1.4 5.6-5.6Z" />
  </svg>
);
