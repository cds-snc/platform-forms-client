import React from "react";
import { useTranslation } from "next-i18next";
import { DesignIcon, PreviewIcon, ShareIcon, PublishIcon, SaveIcon, GearIcon } from "../../icons";
import { useSession } from "next-auth/react";
import { LeftNavLink } from "./LeftNavLink";
import { SaveButton } from "../shared/SaveButton";

export const LeftNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { status } = useSession();

  const iconClassname =
    "inline-block w-6 h-6 xl:block xl:mx-auto group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <nav className="absolute xl:content-center" aria-label={t("navLabelFormBuilder")}>
      <LeftNavLink href="/form-builder/edit">
        <>
          <DesignIcon className={iconClassname} />
          {t("edit")}
        </>
      </LeftNavLink>

      <LeftNavLink href="/form-builder/preview">
        <>
          <PreviewIcon className={iconClassname} />
          {t("preview")}
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

      <LeftNavLink href="/form-builder/settings">
        <>
          <GearIcon className={iconClassname} />
          {t("settings")}
        </>
      </LeftNavLink>
      <SaveButton />
    </nav>
  );
};
