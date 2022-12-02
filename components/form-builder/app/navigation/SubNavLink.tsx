import Link from "next/link";
import React, { ReactElement, useEffect, useState } from "react";
import { useActivePathname } from "../../hooks/useActivePathname";

export const SubNavLink = ({ href, children }: { children: ReactElement; href: string }) => {
  const { asPath, isReady, activePathname } = useActivePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Check if the router fields are updated client-side
    if (isReady) {
      const linkPathname = new URL(href as string, location.href).pathname;
      if (linkPathname === activePathname) {
        setActive(true);
      }
    }
  }, [asPath, isReady, href, setActive, activePathname]);

  return (
    <Link href={href}>
      <a
        href={href}
        className={`${
          active ? "font-bold" : ""
        } no-underline !bg-white !text-black first:pl-0 pl-4 pr-4 !shadow-none`}
      >
        {children}
      </a>
    </Link>
  );
};
