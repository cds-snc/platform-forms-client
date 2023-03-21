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
    "py-2 px-5 rounded-lg border-2 border-solid inline-flex items-center active:top-0.5 focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:text-white-default disabled:!bg-transparent disabled:cursor-not-allowed disabled:!text-gray-500 disabled:hover:no-underline";

  const buttonClasses =
    "group/button border-none hover:bg-gray-600 hover:text-white focus:!bg-blue-hover focus:text-black active:text-white active:bg-blue-hover transition duration-100";

  const responsiveButtonClasses =
    "laptop:bg-transparent laptop:hover:text-black laptop:hover:bg-transparent laptop:hover:underline laptop:px-2";

  const iconClasses =
    "group-hover/button:fill-black group-disabled/button:!fill-gray-500 group-active/button:!fill-white group-focus/button:!fill-white fill-black group-hover/button:fill-white transition duration-100";

  const responsiveIconClasses = "laptop:group-hover/button:fill-black laptop:mr-2";

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
