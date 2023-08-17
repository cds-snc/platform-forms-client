import React, { ReactNode } from "react";
import Link from "next/link";

// TODO: probably should be updated to use the <LinkButton.. component some time

// TODO: consider "repurposing" style to be more generic so this can be a NavLink (left/right/top..)

export const LeftNavLink = ({
  children,
  href,
  id,
  isActive,
}: {
  children: ReactNode | ReactNode[];
  href: string;
  id: string;
  isActive: boolean;
}) => {
  return (
    <Link href={href} id={id} legacyBehavior>
      <a
        href={href}
        className={`${
          isActive ? "font-bold" : ""
        } group mb-2 block rounded py-1 pl-2 pr-0 text-black-default no-underline !shadow-none visited:text-black-default hover:text-blue-hover focus:bg-blue-hover focus:text-white-default active:bg-blue-hover active:text-white-default active:no-underline laptop:pr-2`}
        {...(isActive && { "aria-current": "page" })}
      >
        {children}
      </a>
    </Link>
  );
};
