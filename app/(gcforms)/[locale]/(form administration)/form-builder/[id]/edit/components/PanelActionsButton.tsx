"use client";
import React, { ComponentType, JSXElementConstructor } from "react";

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
}) => {
  const baseButtonClasses =
    "py-2 px-5 rounded-lg border-2 border-solid inline-flex items-center active:top-0.5 focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 disabled:!bg-transparent disabled:cursor-not-allowed disabled:!text-gray-500 disabled:hover:no-underline";

  const buttonClasses =
    "group/button border-none hover:bg-gray-600 active:text-white transition duration-100 text-slate-50 focus:bg-slate-50 focus:text-slate-800 active:bg-slate-50 active:text-slate-800 hover:text-slate-50";

  const responsiveButtonClasses =
    "laptop:bg-transparent laptop:hover:text-black laptop:hover:text-black laptop:hover:bg-transparent laptop:hover:underline laptop:px-2 laptop:text-slate-800 laptop:focus:!bg-blue-hover laptop:active:bg-blue-hover laptop:focus:text-white-default";

  const iconClasses =
    "group-hover/button:fill-slate-50 group-disabled/button:!fill-gray-500 group-active/button:fill-slate-800 group-focus/button:!fill-slate-800 fill-black group-hover/button:fill-white transition duration-100 fill-slate-50";

  const responsiveIconClasses =
    "laptop:group-hover/button:fill-black laptop:mr-2 laptop:fill-slate-800 laptop:group-active/button:!fill-white laptop:group-focus/button:!fill-white";

  return (
    <button
      onClick={onClick}
      className={`${className} ${buttonClasses} ${baseButtonClasses} ${responsiveButtonClasses}`}
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
          <Icon className={`${iconClasses} ${responsiveIconClasses}`} />
        </div>
      )}
      {children}
    </button>
  );
};
