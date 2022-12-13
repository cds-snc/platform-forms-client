import React from "react";
import { useTranslation } from "next-i18next";
import { DesignIcon, PreviewIcon, PublishIcon, GearIcon } from "../../icons";
import { LeftNavLink } from "./LeftNavLink";
import { SaveButton } from "../shared/SaveButton";
import { useTemplateStore } from "../../store/useTemplateStore";

export const LeftNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { isPublished, id } = useTemplateStore((s) => ({ id: s.id, isPublished: s.isPublished }));

  const iconClassname =
    "inline-block w-6 h-6 xl:block xl:mx-auto group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <nav className="absolute xl:content-center" aria-label={t("navLabelFormBuilder")}>
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
          {t("preview")}
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

      <LeftNavLink href={`/form-builder/settings/${id}`}>
        <>
          <GearIcon className={iconClassname} />
          {t("settings")}
        </>
      </LeftNavLink>

      {!isPublished && <SaveButton />}
    </nav>
  );
};
