import React from "react";
import { useTranslation } from "next-i18next";
import { DesignIcon, PreviewIcon, PublishIcon, GearIcon, MessageIcon } from "../../icons";
import { useTemplateContext } from "@components/form-builder/hooks";
import { SaveButton } from "../shared/SaveButton";
import { useTemplateStore } from "../../store/useTemplateStore";
import { useSession } from "next-auth/react";
import { useActivePathname, cleanPath } from "../../hooks/useActivePathname";
import { NavLink } from "@components/globals/NavLink";

const linkHelper = (url: string, activePathname: string) => {
  const baseUrl = "/form-builder";
  const href = `${baseUrl}${url}`;
  const matchPathWithoutTrailingSlash = cleanPath(href).replace(/\/$/, "");

  return {
    href,
    isActive: activePathname.startsWith(matchPathWithoutTrailingSlash),
  };
};

export const LeftNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { isPublished, id } = useTemplateStore((s) => ({ id: s.id, isPublished: s.isPublished }));
  const { status } = useSession();
  const { activePathname } = useActivePathname();
  const { saveForm } = useTemplateContext();

  const iconClassname =
    "inline-block w-6 h-6 group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <nav aria-label={t("navLabelFormBuilder")}>
      <ul className="m-0 list-none p-0">
        {!isPublished && (
          <li>
            <NavLink {...linkHelper("/edit", activePathname)} onClick={saveForm}>
              <DesignIcon className={iconClassname} />
              {t("edit")}
            </NavLink>
          </li>
        )}
        <li>
          <NavLink {...linkHelper("/preview", activePathname)} onClick={saveForm}>
            <PreviewIcon className={iconClassname} />
            {status === "authenticated" ? t("test") : t("pagePreview")}
          </NavLink>
        </li>
        {!isPublished && (
          <li>
            <NavLink {...linkHelper("/publish", activePathname)} onClick={saveForm}>
              <PublishIcon className={iconClassname} />
              {t("publish")}
            </NavLink>
          </li>
        )}
        <li>
          <NavLink {...linkHelper(`/responses/${id}`, activePathname)} onClick={saveForm}>
            <MessageIcon className={iconClassname} />
            {t("responsesNavLabel")}
          </NavLink>
        </li>
        <li>
          <NavLink {...linkHelper(`/settings/${id}`, activePathname)} onClick={saveForm}>
            <GearIcon className={iconClassname} />
            {t("pageSettings")}
          </NavLink>
        </li>
        {!isPublished && (
          <li>
            <SaveButton />
          </li>
        )}
      </ul>
    </nav>
  );
};
