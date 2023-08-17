import React, { ReactElement } from "react";
import Link from "next/link";

// TODO: probably should be updated to use the <LinkButton.. component some time

// TODO: consider "repurposing" style to be more generic so this can be a NavLink (left/right/top..)

export const LeftNavLink = ({
  children,
  href,
  id,
  isActive,
}: {
  children: ReactElement;
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
        } group no-underline rounded block w-38 py-1 mb-2 pl-2 pr-0 laptop:pr-2 text-black-default hover:text-blue-hover visited:text-black-default focus:text-white-default focus:bg-blue-hover active:no-underline active:bg-blue-hover active:text-white-default !shadow-none`}
        {...(isActive && { "aria-current": "page" })}
      >
        {children}
      </a>
    </Link>
  );
};
