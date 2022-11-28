import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect, useState } from "react";

export const LeftNavLink = ({
  children,
  href,
  subPages,
}: {
  children: ReactElement;
  href: string;
  subPages?: string[];
}) => {
  const { asPath, isReady } = useRouter();
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Check if the router fields are updated client-side
    if (isReady) {
      const linkPathname = new URL(href as string, location.href).pathname;
      const activePathname = new URL(asPath, location.href).pathname;

      if (linkPathname === activePathname || subPages?.includes(activePathname)) {
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
        } group no-underline rounded block xl:w-36 xl:pb-0 xl:pt-2 xl:mb-2 mb-4 -ml-1 pl-1 pr-2 md:pr-0 text-black-default hover:text-blue-hover visited:text-black-default focus:text-white-default focus:bg-blue-hover active:no-underline active:bg-blue-hover active:text-white-default`}
      >
        {children}
      </a>
    </Link>
  );
};
