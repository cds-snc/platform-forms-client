import Link from "next/link";
import React, { ReactElement } from "react";
import { cn } from "@lib/utils";

export const TabNavLink = ({
  href,
  children,
  setAriaCurrent = false,
  id,
  active = false,
  onClick,
}: {
  children: ReactElement;
  href: string;
  setAriaCurrent?: boolean;
  id?: string;
  active: boolean;
  onClick?: () => void;
}) => {
  const baseClasses =
    "mr-3 rounded-t-[25px] border-x border-t border-black bg-white px-5 pb-2 pt-1 no-underline laptop:py-2";

  const inactiveClasses =
    "!text-black hover:bg-gray-600 hover:!text-white-default hover:[&_svg]:fill-white hover:[&_svg]:stroke-white";

  const activeClasses =
    "bg-[#475569] !text-white [&_svg]:fill-white ${svgStroke} focus:text-white focus:[&_svg]:stroke-white";

  return (
    <Link
      href={href}
      className={cn(baseClasses, inactiveClasses, active && activeClasses)}
      {...(setAriaCurrent && active && { "aria-current": "page" })}
      {...(id && { id })}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};
