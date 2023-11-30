import React, { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@lib/utils";

// TODO: probably should be updated to use the <LinkButton.. component some time

// TODO: consider "repurposing" style to be more generic so this can be a NavLink (left/right/top..)

export const NavLink = ({
  href,
  id = "",
  children,
  isActive,
  onClick,
}: {
  href: string;
  id?: string;
  children: ReactNode | ReactNode[];
  isActive: boolean;
  onClick?: () => void;
}) => {
  return (
    <Link href={href} id={id} legacyBehavior>
      <a
        href={href}
        className={cn(
          isActive && "font-bold",
          "group mb-2 block rounded py-1 pl-2 pr-0 text-black-default no-underline !shadow-none visited:text-black-default hover:text-blue-hover focus:bg-blue-hover focus:text-white-default active:bg-blue-hover active:text-white-default active:no-underline laptop:pr-2"
        )}
        {...(isActive && { "aria-current": "page" })}
        onClick={onClick ? () => onClick() : undefined}
      >
        {children}
      </a>
    </Link>
  );
};
