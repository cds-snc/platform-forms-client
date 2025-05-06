import { cn } from "@lib/utils";

export const GcdsH1 = ({
  children,
  tabIndex,
  className,
}: {
  children: React.ReactNode;
  tabIndex?: number;
  className?: string;
}) => {
  return (
    <h1 tabIndex={tabIndex || -1} className={cn("!mb-12 inline-block", className)}>
      {children}
    </h1>
  );
};
