import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { DesignIcon, PreviewIcon, PublishIcon, GearIcon, MessageIcon } from "../../icons";
import { useTemplateContext } from "@components/form-builder/hooks";
import { SaveButton } from "../shared/SaveButton";
import { useTemplateStore } from "../../store/useTemplateStore";
import { useSession } from "next-auth/react";
import { useActivePathname, cleanPath } from "../../hooks/useActivePathname";
import { NavLink } from "@components/globals/NavLink";
import { cn } from "@lib/utils";
import { BackArrowIcon } from "@components/form-builder/icons";
import { Button } from "@components/globals";

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

  const [collapsed, setCollapsed] = useState(false);

  const iconClassname =
    "inline-block w-6 h-6 group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <nav
      aria-label={t("navLabelFormBuilder")}
      className={cn(
        collapsed ? "min-w-[50px]" : "min-w-[181px]",
        "bg-white border-r-slate-500 border-right-1 fixed top-[72px] left-0 z-50 transition-all duration-300"
      )}
    >
      <ul className="m-0 h-[100vh] list-none p-0 pt-12">
        <li>
          <Button
            className="mb-10 text-[18px]"
            theme="link"
            onClick={() => {
              setCollapsed(!collapsed);
            }}
          >
            <>
              <BackArrowIcon className="mr-2 inline-block" />
              {!collapsed && t("leftNav.collapse")}
            </>
          </Button>
        </li>
        {!isPublished && (
          <li>
            <NavLink {...linkHelper("/edit", activePathname)} onClick={saveForm}>
              <DesignIcon className={iconClassname} />
              {!collapsed && t("edit")}
            </NavLink>
          </li>
        )}
        <li>
          <NavLink {...linkHelper("/preview", activePathname)} onClick={saveForm}>
            <PreviewIcon className={iconClassname} />
            {!collapsed ? (status === "authenticated" ? t("test") : t("pagePreview")) : null}
          </NavLink>
        </li>
        <li>
          <NavLink {...linkHelper(`/settings/${id}`, activePathname)} onClick={saveForm}>
            <GearIcon className={iconClassname} />
            {!collapsed && t("pageSettings")}
          </NavLink>
        </li>
        {!isPublished && (
          <li>
            <NavLink {...linkHelper("/publish", activePathname)} onClick={saveForm}>
              <PublishIcon className={iconClassname} />
              {!collapsed && t("publish")}
            </NavLink>
          </li>
        )}
        <li>
          <NavLink {...linkHelper(`/responses/${id}`, activePathname)} onClick={saveForm}>
            <MessageIcon className={cn(iconClassname, "mt-[6px] ml-[2px]")} />
            {!collapsed && t("responsesNavLabel")}
          </NavLink>
        </li>
        {!collapsed && !isPublished && activePathname === "/form-builder/edit" && (
          <li>
            <SaveButton />
          </li>
        )}
      </ul>
    </nav>
  );
};
