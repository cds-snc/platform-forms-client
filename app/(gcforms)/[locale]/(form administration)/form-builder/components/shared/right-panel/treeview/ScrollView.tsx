import * as ScrollArea from "@radix-ui/react-scroll-area";
import { cn } from "@lib/utils";

export const ScrollView = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) => (
  <ScrollArea.Root className="gc-scroll-area-root">
    <div className="gc-scroll-fade"></div>
    <ScrollArea.Viewport className={cn("gc-scroll-area-viewport", className)}>
      {children}
    </ScrollArea.Viewport>
    <div className="gc-scroll-fade-reverse"></div>
    <ScrollArea.Scrollbar className="gc-scroll-area-scrollbar" orientation="vertical">
      <ScrollArea.Thumb className="gc-scroll-area-thumb" />
    </ScrollArea.Scrollbar>
    <ScrollArea.Corner className="gc-scroll-area-corner" />
  </ScrollArea.Root>
);
