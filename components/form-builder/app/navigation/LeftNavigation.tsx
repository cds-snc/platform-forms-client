import React from "react";
import { useTranslation } from "next-i18next";
import { DesignIcon, PreviewIcon, PublishIcon, GearIcon, MessageIcon } from "../../icons";
import { LeftNavLink } from "./LeftNavLink";
import { SaveButton } from "../shared/SaveButton";
import { useTemplateStore } from "../../store/useTemplateStore";
import { useSession } from "next-auth/react";
import { useFlag } from "@lib/hooks";

export const LeftNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { isPublished, id } = useTemplateStore((s) => ({ id: s.id, isPublished: s.isPublished }));
  const { status } = useSession();
  const { status: vault } = useFlag("vault");

  // const iconClassname =
  //   "inline-block w-6 h-6 xl:block xl:mx-auto group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  const iconClassname =
    "inline-block w-6 h-6 group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <nav className="absolute" aria-label={t("navLabelFormBuilder")}>
      {!isPublished && (
        <LeftNavLink href="/form-builder/edit">
          <>
            <DesignIcon className={iconClassname} />
            {t("edit")}
          </>
        </LeftNavLink>
      )}

      <LeftNavLink href="/form-builder/preview">
        <>
          <PreviewIcon className={iconClassname} />
          {status === "authenticated" ? t("test") : t("pagePreview")}
        </>
      </LeftNavLink>

      {!isPublished && (
        <LeftNavLink href="/form-builder/publish">
          <>
            <PublishIcon className={iconClassname} />
            {t("publish")}
          </>
        </LeftNavLink>
      )}

      {vault && (
        <LeftNavLink href={`/form-builder/responses/${id}`}>
          <>
            <MessageIcon className={iconClassname} />
            {t("responses.navLabel")}
          </>
        </LeftNavLink>
      )}

      <LeftNavLink href={`/form-builder/settings/${id}`}>
        <>
          <GearIcon className={iconClassname} />
          {t("pageSettings")}
        </>
      </LeftNavLink>

      {!isPublished && <SaveButton />}
    </nav>
  );
};
