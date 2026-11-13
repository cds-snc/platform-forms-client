import { cn } from "@lib/utils";
import { GcdsHeading } from "@gcds-core/components-react";

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
    <GcdsHeading tag="h1" tabIndex={tabIndex ?? -1} className={cn(className)}>
      {children}
    </GcdsHeading>
  );
};
