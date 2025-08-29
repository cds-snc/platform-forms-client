"use client";
import type { JSX } from "react";
import { cn } from "@lib/utils";
import { Tooltip } from "@formBuilder/components/shared/Tooltip";
import { Button } from "@clientComponents/globals";

type CircleProps = {
  id: string;
  children: JSX.Element | string;
  className?: string;
  title?: string;
  dataTestId: string;
  onClick?: () => void;
};

export const CircleButton = ({
  children,
  title = "",
  onClick,
  className,
  dataTestId,
  id,
}: CircleProps) => {
  return (
    <div className="relative z-10 flex size-[50px]">
      <Tooltip.Simple text={title} side="left">
        <Button
          id={id}
          theme="secondary"
          aria-label={title}
          onClick={onClick}
          dataTestId={dataTestId}
          className={cn(
            className,
            "rounded-full border-slate-300 hover:bg-white hover:border-indigo-700 focus:bg-slate-800 [&_svg]:focus:fill-white "
          )}
        >
          {children}
        </Button>
      </Tooltip.Simple>
    </div>
  );
};
