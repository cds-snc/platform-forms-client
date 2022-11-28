import React from "react";
import { useTranslation } from "next-i18next";
import { DesignIcon, PreviewIcon, ShareIcon, PublishIcon, SaveIcon } from "../../icons";
import { useSession } from "next-auth/react";
import { LeftNavLink } from "./LeftNavLink";

export const LeftNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { status } = useSession();

  const iconClassname =
    "inline-block xl:block xl:mx-auto group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <nav className="col-span-3" aria-label={t("navLabelFormBuilder")}>
      <LeftNavLink href="/form-builder/edit" subPages={["form-builder/translate"]}>
        <>
          <DesignIcon className={iconClassname} />
          {t("edit")}
        </>
      </LeftNavLink>

      <LeftNavLink
        href="/form-builder/preview"
        subPages={["form-builder/test-data-delivery", "form-builder/settings"]}
      >
        <>
          <PreviewIcon className={iconClassname} />
          {t("preview")}
        </>
      </LeftNavLink>

      <LeftNavLink href="/form-builder/share">
        <>
          <ShareIcon className={iconClassname} />
          {t("share")}
        </>
      </LeftNavLink>

      {status !== "authenticated" && (
        <LeftNavLink href="/form-builder/save">
          <>
            <SaveIcon className={iconClassname} />
            {t("save")}
          </>
        </LeftNavLink>
      )}

      <LeftNavLink href="/form-builder/publish">
        <>
          <PublishIcon className={iconClassname} />
          {t("publish")}
        </>
      </LeftNavLink>
    </nav>
  );
};
