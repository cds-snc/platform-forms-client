import Link from "next/link";
import React, { ReactElement, useEffect, useState } from "react";
import { useActivePathname } from "../../hooks/useActivePathname";

export const SubNavLink = ({
  href,
  children,
  className,
  activeClassName,
}: {
  children: ReactElement;
  href: string;
  className: string;
  activeClassName: string;
}) => {
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
          active ? `bg-[#475569] !text-white ${activeClassName}` : `${className}`
        } no-underline !shadow-none border-black border-1 rounded-[100px] py-2 px-5 mr-3`}
      >
        {children}
      </a>
    </Link>
  );
};
