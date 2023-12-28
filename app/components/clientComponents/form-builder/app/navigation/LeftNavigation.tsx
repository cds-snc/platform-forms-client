import React from "react";
import { useTranslation } from "@i18n/client";
import { DesignIcon, PreviewIcon, PublishIcon, GearIcon, MessageIcon } from "../../../icons";
import { useTemplateContext } from "@clientComponents/form-builder/hooks";
import { SaveButton } from "../shared/SaveButton";
import { useTemplateStore } from "../../store/useTemplateStore";
import { useSession } from "next-auth/react";
import { useActivePathname } from "../../hooks/useActivePathname";
import { NavLink } from "@clientComponents/globals/NavLink";
import { cn } from "@lib/utils";

const linkHelper = (route: string, activePathname: string, id?: string) => {
  const pathTest = new RegExp(`/(en|fr)/form-builder/${route}(.*)?`);

  return {
    href: `/form-builder/${route}${id ? `/${id}` : ""}`,
    isActive: pathTest.test(activePathname),
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
            <NavLink {...linkHelper("edit", activePathname)} onClick={saveForm}>
              <DesignIcon className={iconClassname} />
              {t("edit")}
            </NavLink>
          </li>
        )}
        <li>
          <NavLink {...linkHelper("preview", activePathname)} onClick={saveForm}>
            <PreviewIcon className={iconClassname} />
            {status === "authenticated" ? t("test") : t("pagePreview")}
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
            <NavLink {...linkHelper("publish", activePathname)} onClick={saveForm}>
              <PublishIcon className={iconClassname} />
              {t("publish")}
            </NavLink>
          </li>
        )}
        <li>
          <NavLink {...linkHelper(`/responses/${id}`, activePathname)} onClick={saveForm}>
            <MessageIcon className={cn(iconClassname, "mt-[6px] ml-[2px]")} />
            {t("responsesNavLabel")}
          </NavLink>
        </li>
        <li>
          <NavLink {...linkHelper("settings", activePathname, id)} onClick={saveForm}>
            <GearIcon className={iconClassname} />
            {t("pageSettings")}
          </NavLink>
        </li>
        {!isPublished && activePathname === "/form-builder/edit" && (
          <li>
            <SaveButton />
          </li>
        )}
      </ul>
    </nav>
  );
};
