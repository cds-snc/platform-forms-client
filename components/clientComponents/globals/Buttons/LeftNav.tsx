"use client";
import type { JSX } from "react";
import { cn } from "@lib/utils";
import { Tooltip } from "@formBuilder/components/shared/Tooltip";
import Link from "next/link";

type LinkButtonProps = {
  href: string;
  children: JSX.Element | string;
  className?: string;
  scroll?: boolean;
  title?: string;
  onClick?: () => void;
  isActive?: boolean;
  testid?: string;
};

export const LeftNav = ({
  href,
  children,
  title = "",
  onClick,
  isActive,
  testid,
}: LinkButtonProps) => {
  const classes = {
    base: "border-box flex h-[60px] w-[60px] items-center justify-center text-black-default no-underline ",
    hover: "hover:border-indigo-700 [&_svg]:hover:fill-indigo-700 hover:border-1 ",
    focus:
      "focus:border-indigo-700 focus:bg-white [&_svg]:focus:fill-indigo-700 focus:outline-[0px] focus:outline-offset-0 focus:outline-indigo-700 focus:border-1",
    active:
      "active:top-0.5 active:bg-indigo-700 [&_svg]:active:fill-white active:text-white active:outline-[0px] active:outline-indigo-700",
    isActive:
      "bg-indigo-700 [&_svg]:fill-white [&_svg]:hover:fill-white outline-[0px] outline-indigo-700 focus:outline-[0px] focus:outline-offset-0",
  };

  return (
    <div className="relative z-10 flex size-[60px]">
      <Tooltip.Simple text={title} side="right">
        <Link
          {...(isActive && { "aria-current": "page" })}
          aria-label={title}
          href={href}
          onClick={onClick}
          data-testid={testid ? testid : ""}
          className={cn(
            classes.base,
            classes.hover,
            !isActive && classes.focus,
            classes.active,
            isActive && classes.isActive
          )}
        >
          {children}
        </Link>
      </Tooltip.Simple>
    </div>
  );
};
