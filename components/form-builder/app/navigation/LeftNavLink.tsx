import { useTemplateContext } from "@components/form-builder/hooks";
import Link from "next/link";
import React, { ReactElement, useEffect, useState } from "react";
import { useActivePathname, cleanPath } from "../../hooks/useActivePathname";

export const LeftNavLink = ({ children, href }: { children: ReactElement; href: string }) => {
  const [active, setActive] = useState(false);
  const { isReady, activePathname } = useActivePathname();
  const { saveForm } = useTemplateContext();

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
    <Link href={href} legacyBehavior passHref>
      <a
        href={"will_be_replaced_by_nextjs"}
        onClick={saveForm}
        className={`${
          active ? "font-bold" : ""
        } group no-underline rounded block w-38 py-1 mb-2 pl-2 pr-0 laptop:pr-2 text-black-default hover:text-blue-hover visited:text-black-default focus:text-white-default focus:bg-blue-hover active:no-underline active:bg-blue-hover active:text-white-default !shadow-none`}
        {...(active && { "aria-current": "page" })}
      >
        {children}
      </a>
    </Link>
  );
};
