import * as ScrollArea from "@radix-ui/react-scroll-area";
import { cn } from "@lib/utils";
import { getNonce } from "./actions";

export const ScrollView = async ({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) => {
  const nonce = (await getNonce()) as string;
  return (
    <ScrollArea.Root nonce={nonce} className="gc-scroll-area-root">
      <div className="gc-scroll-fade"></div>
      <ScrollArea.Viewport nonce={nonce} className={cn("gc-scroll-area-viewport", className)}>
        {children}
      </ScrollArea.Viewport>
      <div className="gc-scroll-fade-reverse"></div>
      <ScrollArea.Scrollbar
        nonce={nonce}
        className="gc-scroll-area-scrollbar"
        orientation="vertical"
      >
        <ScrollArea.Thumb nonce={nonce} className="gc-scroll-area-thumb" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner nonce={nonce} className="gc-scroll-area-corner" />
    </ScrollArea.Root>
  );
};
