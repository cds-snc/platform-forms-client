import React from "react";
import Link from "next/link";
import { cn } from "@lib/utils";

export const NavLink = ({
  href,
  children,
  id,
  active,
}: {
  children: React.ReactNode;
  href: string;
  id: string;
  active: boolean;
}) => {
  const baseClasses =
    "mb-4 mr-3 rounded-[100px] border-1 border-black bg-white px-5 pb-2 pt-1 no-underline !shadow-none laptop:py-2";

  const inactiveClasses =
    "!text-black hover:bg-gray-600 hover:!text-white-default focus:!text-white [&_svg]:hover:fill-white [&_svg]:hover:stroke-white [&_svg]:focus:fill-white";
  const activeClasses =
    "bg-[#475569] !text-white [&_svg]:fill-white ${svgStroke} focus:text-white [&_svg]:focus:stroke-white";

  return (
    <Link
      href={href}
      id={id}
      className={cn(baseClasses, inactiveClasses, active && activeClasses)}
      {...(active && { "aria-current": "page" })}
    >
      {children}
    </Link>
  );
};
