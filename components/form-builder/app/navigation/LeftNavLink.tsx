import { useTemplateContext } from "@components/form-builder/hooks";
import Link from "next/link";
import React, { ReactNode, useEffect, useState } from "react";
import { useActivePathname, cleanPath } from "../../hooks/useActivePathname";

export const LeftNavLink = ({
  children,
  href,
}: {
  children: ReactNode | ReactNode[];
  href: string;
}) => {
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
        } group mb-2 block w-40 rounded py-1 pl-2 pr-0 text-black-default no-underline !shadow-none visited:text-black-default hover:text-blue-hover focus:bg-blue-hover focus:text-white-default active:bg-blue-hover active:text-white-default active:no-underline laptop:pr-2`}
        {...(active && { "aria-current": "page" })}
      >
        {children}
      </a>
    </Link>
  );
};
