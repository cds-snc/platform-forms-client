import { useTemplateContext } from "@components/form-builder/hooks";
import { useTemplateStore } from "@components/form-builder/store";
import { logMessage } from "@lib/logger";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { ReactElement, useEffect, useState, useCallback } from "react";
import { useActivePathname, cleanPath } from "../../hooks/useActivePathname";

export const LeftNavLink = ({ children, href }: { children: ReactElement; href: string }) => {
  const [active, setActive] = useState(false);
  const { isReady, activePathname } = useActivePathname();
  const { status } = useSession();
  const { saveForm } = useTemplateContext();
  const { setId, getIsPublished } = useTemplateStore((s) => ({
    setId: s.setId,
    getIsPublished: s.getIsPublished,
  }));

  const saveOnNavigate = useCallback(async () => {
    if (status === "authenticated" && !getIsPublished()) {
      logMessage.debug("Saving form before navigating away");
      const result = await saveForm();
      if (result) {
        setId(result);
      }
    }
  }, [status, saveForm, setId, getIsPublished]);

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
    <Link href={href} passHref>
      {/* passHref does ensure the child a tag has the correct HREF attribute */}
      <a
        href={"will_be_replaced_by_nextjs"}
        onClick={saveOnNavigate}
        className={`${
          active ? "font-bold" : ""
        } group no-underline rounded block w-38 py-1 mb-2 pl-2 pr-0 laptop:pr-2 text-black-default hover:text-blue-hover visited:text-black-default focus:text-white-default focus:bg-blue-hover active:no-underline active:bg-blue-hover active:text-white-default !shadow-none`}
      >
        {children}
      </a>
    </Link>
  );
};
