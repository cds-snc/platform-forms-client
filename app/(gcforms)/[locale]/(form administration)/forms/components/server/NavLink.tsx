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
    "block w-full px-4 py-3 mb-1 text-left no-underline rounded transition-colors";
  const inactiveClasses =
    "!text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-slate-700";
  const activeClasses =
    "bg-violet-700 !text-white font-bold hover:bg-slate-500 hover:!text-white focus:outline-none focus:ring-2 focus:ring-slate-700 [&_svg]:fill-white [&_svg]:stroke-white";

  return (
    <Link
      href={href}
      id={id}
      className={cn(baseClasses, active ? activeClasses : inactiveClasses)}
      {...(active && { "aria-current": "page" })}
      prefetch={false}
    >
      {children}
    </Link>
  );
};
