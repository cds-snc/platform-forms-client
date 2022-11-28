import React, { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { DesignIcon, PreviewIcon, ShareIcon, PublishIcon, SaveIcon } from "../icons";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

const SideNavLink = ({ children, href }: { children: ReactElement; href: string }) => {
  const { asPath, isReady } = useRouter();
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Check if the router fields are updated client-side
    if (isReady) {
      const linkPathname = new URL(href as string, location.href).pathname;
      const activePathname = new URL(asPath, location.href).pathname;

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
        } group no-underline rounded block mb-4 -ml-1 pl-1 pr-2 text-black-default hover:text-blue-hover visited:text-black-default focus:text-white-default focus:bg-blue-hover active:no-underline active:bg-blue-hover active:text-white-default`}
      >
        {children}
      </a>
    </Link>
  );
};

export const LeftNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { status } = useSession();

  const iconClassname =
    "inline-block group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <nav className="col-span-3" aria-label={t("navLabelFormBuilder")}>
      <SideNavLink href="/form-builder/edit">
        <>
          <DesignIcon className={iconClassname} />
          {t("edit")}
        </>
      </SideNavLink>

      <SideNavLink href="/form-builder/preview">
        <>
          <PreviewIcon className={iconClassname} />
          {t("preview")}
        </>
      </SideNavLink>

      <SideNavLink href="/form-builder/share">
        <>
          <ShareIcon className={iconClassname} />
          {t("share")}
        </>
      </SideNavLink>

      {status !== "authenticated" && (
        <SideNavLink href="/form-builder/save">
          <>
            <SaveIcon className={iconClassname} />
            {t("save")}
          </>
        </SideNavLink>
      )}

      <SideNavLink href="/form-builder/publish">
        <>
          <PublishIcon className={iconClassname} />
          {t("publish")}
        </>
      </SideNavLink>
    </nav>
  );
};
