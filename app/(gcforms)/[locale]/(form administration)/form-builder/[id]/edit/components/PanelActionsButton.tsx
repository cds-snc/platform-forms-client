"use client";
import React, { ComponentType, JSXElementConstructor } from "react";
import { cn } from "@lib/utils";

export const PanelActionsButton = ({
  children,
  onClick,
  className,
  id,
  icon: Icon,
  disabled = false,
  "aria-label": ariaLabel = undefined,
  tabIndex = 0,
  buttonRef,
  dataTestId,
  isSubPanel = false,
}: {
  children?: JSX.Element | string;
  id?: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: JSXElementConstructor<any> | ComponentType | JSX.Element | any;
  disabled?: boolean;
  "aria-label"?: string;
  tabIndex?: number;
  buttonRef?: (el: HTMLButtonElement) => void;
  dataTestId?: string;
  isSubPanel?: boolean;
}) => {
  const baseButtonClasses =
    "inline-flex items-center rounded-lg border-2 border-solid px-5 py-2 focus:outline focus:outline-[3px] focus:outline-offset-2 focus:outline-blue-focus active:top-0.5 disabled:cursor-not-allowed disabled:!bg-transparent disabled:!text-gray-500 disabled:hover:no-underline";

  const buttonClasses =
    "group/button border-none text-slate-50 transition duration-100 hover:bg-gray-600 hover:text-slate-50 focus:bg-slate-50 focus:text-slate-800 active:bg-slate-50 active:text-white";

  const responsiveButtonClasses =
    "laptop:bg-transparent laptop:px-2 laptop:text-slate-800 laptop:hover:bg-transparent laptop:hover:text-black laptop:hover:underline laptop:focus:!bg-blue-hover laptop:focus:text-black laptop:active:bg-blue-hover laptop:active:text-white laptop:focus:text-white";

  const tabletButtonClasses = "tablet:active:text-black";

  const iconClasses = !isSubPanel
    ? "fill-white transition duration-100 group-hover/button:fill-white group-focus/button:!fill-slate-800 group-active/button:fill-slate-800 group-disabled/button:!fill-gray-500 disabled:cursor-not-allowed"
    : "fill-blue group-focus/sub-button:fill-blue group-active/sub-button:fill-blue group-disabled/sub-button:!fill-gray-500";

  const responsiveIconClasses =
    "laptop:mr-2 laptop:fill-slate-800 laptop:group-hover/button:fill-black laptop:group-focus/button:!fill-white laptop:group-active/button:!fill-white";

  const classes = !isSubPanel
    ? cn(baseButtonClasses, buttonClasses, responsiveButtonClasses, tabletButtonClasses, className)
    : cn(
        "group/sub-button flex transition duration-100 text-blue rounded-lg px-2 py-1 hover:underline focus:outline focus:outline-[3px] focus:outline-offset-2 focus:outline-blue-focus disabled:cursor-not-allowed disabled:!bg-transparent disabled:!text-gray-500 disabled:hover:no-underline",
        className
      );

  return (
    <div className="">
      <button
        onClick={onClick}
        className={classes}
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        type="button"
        tabIndex={tabIndex}
        ref={buttonRef}
        data-testid={dataTestId}
      >
        {Icon && (
          <div className="inline-block">
            <Icon className={cn(iconClasses, responsiveIconClasses)} />
          </div>
        )}
        {children}
      </button>
    </div>
  );
};
