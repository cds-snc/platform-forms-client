"use client";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import React from "react";
import { cn } from "@lib/utils";

interface TooltipProps {
  text: string;
  className?: string;
  children: React.ReactNode | string;
  side?: "left" | "right" | "top" | "bottom";
}

export const Tooltip = ({ text, children, className = "", side = "left" }: TooltipProps) => {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <span>{children}</span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          sideOffset={4}
          side={side}
          className={cn("inline-flex items-center rounded-md px-4 py-2 bg-slate-800", className)}
        >
          <TooltipPrimitive.Arrow className="fill-current" />
          <span className="block text-base leading-none text-white">{text}</span>
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
