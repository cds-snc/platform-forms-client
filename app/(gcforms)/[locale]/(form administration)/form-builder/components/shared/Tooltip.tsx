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
  align?: "start" | "center" | "end";
  sideOffset?: number;
  iconTitle?: string;
  label?: string;
}

interface TooltipSimpleProps extends TooltipProps {
  text: string;
}

const Simple = ({
  text,
  children,
  tooltipClassName = "",
  triggerClassName = "",
  side = "left",
  align = "center",
  sideOffset = 4,
}: TooltipSimpleProps) => {
  return (
    <TooltipPrimitive.Provider delayDuration={100}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <span>{children}</span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          sideOffset={sideOffset}
          side={side}
          align={align}
          className={cn(
            "inline-flex items-center rounded-md bg-slate-800 px-4 py-2",
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

const CustomTrigger = ({
  trigger,
  children,
  tooltipClassName = "",
  side = "left",
  align = "center",
  sideOffset = 4,
}: CustomTooltipProps) => {
  return (
    <TooltipPrimitive.Provider delayDuration={100}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{trigger}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          sideOffset={sideOffset}
          side={side}
          align={align}
          className={cn(
            "z-1000 max-w-80 rounded-md border border-violet-400 bg-violet-100 p-4",
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

const Info = ({
  children,
  tooltipClassName = "",
  triggerClassName = "",
  side = "left",
  align = "center",
  sideOffset = 4,
  iconTitle,
  // Works but an html label would be more future proof - otherwise fails WCAG SC, all controls have a label
  // TODO update all tooltips to use pass a label, then replace aria-labe with an html label
  label,
}: TooltipProps) => {
  return (
    <TooltipPrimitive.Provider delayDuration={100}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <button className={cn("", triggerClassName)} aria-label={label}>
            <HelpIcon {...(iconTitle && { title: iconTitle })} />
          </button>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          sideOffset={sideOffset}
          side={side}
          align={align}
          className={cn(
            "z-1000 max-w-80 rounded-md border border-violet-400 bg-violet-100 p-4",
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
