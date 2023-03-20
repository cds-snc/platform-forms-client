import React, { ComponentType, JSXElementConstructor, ReactElement } from "react";

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
  const buttonClasses =
    "group/button border-none transition duration-100 h-0 !py-5 lg:!pb-3 !pl-4 !pr-2 m-1 laptop:bg-transparent hover:!bg-gray-600 hover:!text-white laptop:hover:!text-black laptop:hover:!bg-transparent focus:!bg-blue-hover focus:text-black xl:focus:text-white active:text-white disabled:!bg-transparent";
  const iconClasses =
    "group-hover/button:fill-black group-disabled/button:!fill-gray-500 group-active/button:!fill-white group-focus/button:!fill-white xl:!fill-black xl:group-hover/button:!fill-white transition duration-100";

  return (
    <button
      onClick={onClick}
      className={`${
        className || ""
      } bg-transparent text-black border-black hover:text-black hover:underline active:text-black active:bg-gray-500`}
      id={id}
      disabled={disabled}
      aria-label={ariaLabel}
      type="button"
      tabIndex={tabIndex}
      ref={buttonRef}
      data-testid={dataTestId}
    >
      {Icon && (
        <div className={`inline-block`}>
          <Icon className={iconClasses} />
        </div>
      )}
      {children}
    </button>
  );
};
