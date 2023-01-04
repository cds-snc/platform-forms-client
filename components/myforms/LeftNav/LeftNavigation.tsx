import React, { ReactNode } from "react";
import { LeftNavLink } from "./LeftNavLink";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { PageIcon, GlobeIcon, FolderIcon } from "@components/form-builder/icons";

const LinkWrapper = ({ children }: { children: ReactNode }) => (
  <div className="flex max-w-[200px] py-1">{children}</div>
);

const LinkText = ({ children }: { children: ReactNode }) => (
  <span className="inline-block leading-[24px] mt-1">{children}</span>
);

export const LeftNavigation = () => {
  const { t, i18n } = useTranslation(["my-forms", "form-builder"]);
  const router = useRouter();
  const path = String(router.query?.path);

  const iconClassname =
    "inline-block mr-1 inline-block min-w-[24px] w-6 h-6 xl:block xl:mx-auto group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2.5 mt-1";

  return (
    <nav className="absolute xl:content-center">
      <LeftNavLink
        id="tab-drafts"
        href={`/${i18n.language}/myforms/drafts`}
        isActive={path === "drafts"}
      >
        <LinkWrapper>
          <PageIcon className={iconClassname} />
          <LinkText>{t("nav.drafts")}</LinkText>
        </LinkWrapper>
      </LeftNavLink>

      <LeftNavLink
        id="tab-published"
        href={`/${i18n.language}/myforms/published`}
        isActive={path === "published"}
      >
        <LinkWrapper>
          <GlobeIcon className={iconClassname} />
          <LinkText>{t("nav.published")}</LinkText>
        </LinkWrapper>
      </LeftNavLink>

      <LeftNavLink id="tab-all" href={`/${i18n.language}/myforms/all`} isActive={path === "all"}>
        <LinkWrapper>
          <FolderIcon className={iconClassname} />
          <LinkText>{t("nav.all")}</LinkText>
        </LinkWrapper>
      </LeftNavLink>
    </nav>
  );
};
