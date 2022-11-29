import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect, useState } from "react";

export const SubNavLink = ({ href, children }: { children: ReactElement; href: string }) => {
  const { asPath, isReady } = useRouter();
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Check if the router fields are updated client-side
    if (isReady) {
      const linkPathname = new URL(href as string, location.href).pathname;
      let activePathname = new URL(asPath, location.href).pathname;

      // TemplateId is always 25 characters long. If present, remove it from the activePathname.
      const end = activePathname.substring(activePathname.lastIndexOf("/") + 1);
      if (end.length === 25) {
        activePathname = activePathname.substring(0, activePathname.lastIndexOf("/"));
      }

      if (linkPathname === activePathname) {
        setActive(true);
      }
    }
  }, [asPath, isReady, href, setActive]);

  return (
    <Link href={href}>
      <a
        href={href}
        className={`${
          active ? "font-bold" : ""
        } no-underline !bg-white-default !text-black-default visited:text-black-default first:pl-0 pl-4 pr-4`}
      >
        {children}
      </a>
    </Link>
  );
};
