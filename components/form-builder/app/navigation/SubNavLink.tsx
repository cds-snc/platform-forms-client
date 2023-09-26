import Link from "next/link";
import React, { ReactElement, useEffect, useState } from "react";
import { useActivePathname } from "../../hooks/useActivePathname";
import { cn } from "@lib/utils";

export const SubNavLink = ({
  href,
  children,
  setAriaCurrent = false,
  id,
}: {
  children: ReactElement;
  href: string;
  setAriaCurrent?: boolean;
  id?: string;
}) => {
  const baseClasses =
    "mb-4 mr-3 rounded-[100px] border-1 border-black bg-white px-5 pb-2 pt-1 no-underline !shadow-none laptop:py-2";

  const inactiveClasses =
    "!text-black hover:bg-gray-600 hover:!text-white-default focus:!text-white [&_svg]:hover:fill-white [&_svg]:hover:stroke-white [&_svg]:focus:fill-white";
  const activeClasses =
    "bg-[#475569] !text-white [&_svg]:fill-white ${svgStroke} focus:text-white [&_svg]:focus:stroke-white";

  const { asPath, isReady, activePathname } = useActivePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Check if the router fields are updated client-side
    if (isReady) {
      let linkPathname = new URL(href as string, location.href).pathname;

      const langRegex = /\/(en|fr)\//;
      linkPathname = linkPathname.replace(langRegex, "/");

      if (linkPathname === activePathname) {
        setActive(true);
      } else {
        setActive(false);
      }
    }
  }, [asPath, isReady, href, setActive, activePathname]);

  return (
    <Link href={href} legacyBehavior>
      <a
        href={href}
        className={cn(baseClasses, inactiveClasses, active && activeClasses)}
        {...(setAriaCurrent && active && { "aria-current": "page" })}
        {...(id && { id })}
      >
        {children}
      </a>
    </Link>
  );
};
