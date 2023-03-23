import Link from "next/link";
import React, { ReactElement, useEffect, useState } from "react";
import { useActivePathname, cleanPath } from "../../hooks/useActivePathname";

export const LeftNavLink = ({ children, href }: { children: ReactElement; href: string }) => {
  const [active, setActive] = useState(false);
  const { isReady, activePathname } = useActivePathname();
  useEffect(() => {
    if (isReady) {
      const linkPathname = cleanPath(
        new URL(href as string, location.href).pathname.replace(/\/*$/, "")
      );

      if (activePathname.startsWith(linkPathname)) {
        setActive(true);
      }
    }
  }, [activePathname, isReady, href, setActive]);
  return (
    <Link href={href} legacyBehavior>
      <a
        href={href}
        className={`${
          active ? "font-bold" : ""
        } group no-underline rounded block w-36 pb-0 pt-2 mb-2 pr-0 laptop:pr-2 text-black-default hover:text-blue-hover visited:text-black-default focus:text-white-default focus:bg-blue-hover active:no-underline active:bg-blue-hover active:text-white-default !shadow-none`}
      >
        {children}
      </a>
    </Link>
  );
};
