import React, { ReactElement } from "react";
import Link from "next/link";

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
        } group xl:text-center no-underline rounded block xl:w-36 xl:pb-0 xl:pt-2 xl:mb-2 mb-4 -ml-1 pl-1 pr-2 md:pr-0 text-black-default hover:text-blue-hover visited:text-black-default focus:text-white-default focus:bg-blue-hover active:no-underline active:bg-blue-hover active:text-white-default`}
      >
        {children}
      </a>
    </Link>
  );
};
