"use client";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import React from "react";
import { cn } from "@lib/utils";
import { HelpIcon } from "@serverComponents/icons";

interface TooltipProps {
  tooltipClassName?: string;
  triggerClassName?: string;
  children: React.ReactNode | string;
  side?: "left" | "right" | "top" | "bottom";
}

interface TooltipSimpleProps extends TooltipProps {
  text: string;
}

export const Simple = ({
  text,
  children,
  tooltipClassName = "",
  triggerClassName = "",
  side = "left",
}: TooltipSimpleProps) => {
  return (
    <TooltipPrimitive.Provider delayDuration={100}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <span>{children}</span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          sideOffset={4}
          side={side}
          className={cn(
            "inline-flex items-center rounded-md px-4 py-2 bg-slate-800",
            tooltipClassName
          )}
        >
          <TooltipPrimitive.Arrow className={cn("fill-current", triggerClassName)} />
          <span className="block text-base leading-none text-white">{text}</span>
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

interface CustomTooltipProps extends TooltipProps {
  trigger: React.ReactNode | string;
}

export const CustomTrigger = ({
  trigger,
  children,
  tooltipClassName = "",
  side = "left",
}: CustomTooltipProps) => {
  return (
    <TooltipPrimitive.Provider delayDuration={100}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{trigger}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          sideOffset={4}
          side={side}
          className={cn(
            "max-w-80 bg-violet-100 p-4 border border-violet-400 z-[1000] rounded-md",
            tooltipClassName
          )}
        >
          <TooltipPrimitive.Arrow className="fill-current" />
          {children}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export const Info = ({
  children,
  tooltipClassName = "",
  triggerClassName = "",
  side = "left",
}: TooltipProps) => {
  return (
    <TooltipPrimitive.Provider delayDuration={100}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <button className={cn("", triggerClassName)}>
            <HelpIcon />
          </button>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          sideOffset={4}
          side={side}
          className={cn(
            "max-w-80 bg-violet-100 p-4 border border-violet-400 z-[1000] rounded-md",
            tooltipClassName
          )}
        >
          <TooltipPrimitive.Arrow className="fill-current" />
          {children}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export const Tooltip = {
  Simple,
  Info,
  CustomTrigger,
};
