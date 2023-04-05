import Link from "next/link";
import React, { ReactElement, useEffect, useState } from "react";
import { useActivePathname } from "../../hooks/useActivePathname";

export const SubNavLink = ({ href, children }: { children: ReactElement; href: string }) => {
  const baseClasses =
    "no-underline !shadow-none border-black border-1 rounded-[100px] pt-1 pb-2 laptop:py-2 px-5 mr-3 mb-4";

  const inactiveClasses =
    "!text-black focus:!text-white [&_svg]:focus:fill-white [&_svg]:hover:stroke-white [&_svg]:hover:fill-white hover:bg-gray-600 hover:!text-white-default";
  const activeClasses =
    "bg-[#475569] !text-white [&_svg]:fill-white ${svgStroke} focus:text-white [&_svg]:focus:stroke-white";

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
    <Link href={href} legacyBehavior>
      <a
        href={href}
        className={`${active ? `${activeClasses}` : `${inactiveClasses}`} ${baseClasses}`}
      >
        {children}
      </a>
    </Link>
  );
};
