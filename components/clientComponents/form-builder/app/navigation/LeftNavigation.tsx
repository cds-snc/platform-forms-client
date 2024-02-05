"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import {
  NavEditIcon,
  NavPreviewIcon,
  NavPublishIcon,
  NavSettingsIcon,
  NavResponsesIcon,
} from "@clientComponents/icons";
import { useTemplateContext } from "@clientComponents/form-builder/hooks";
import { useTemplateStore } from "../../store/useTemplateStore";
import { useActivePathname } from "../../hooks/useActivePathname";
import { LeftNav } from "@clientComponents/globals/Buttons/LinkButton";

const linkHelper = ({
  route,
  activePathname,
  id,
  language,
}: {
  route: string;
  activePathname: string;
  id?: string;
  language: string;
}) => {
  return {
    href: `/${language}/form-builder${route}${id ? `/${id}` : ""}`,
    isActive: activePathname.includes(`/form-builder${route}`),
  };
};

export const LeftNavigation = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation("form-builder");
  const { isPublished, id } = useTemplateStore((s) => ({ id: s.id, isPublished: s.isPublished }));
  const { activePathname } = useActivePathname();
  const { saveForm } = useTemplateContext();

  return (
    <nav aria-label={t("navLabelFormBuilder")}>
      <ul className="m-0 list-none p-0">
        {!isPublished && (
          <li>
            <LeftNav
              testid="edit"
              {...linkHelper({ route: "/edit", id, activePathname, language })}
              onClick={saveForm}
              title={t("edit")}
            >
              <NavEditIcon />
            </LeftNav>
          </li>
        )}
        <li>
          <LeftNav
            testid="preview"
            {...linkHelper({ route: "/preview", id, activePathname, language })}
            onClick={saveForm}
            title={t("test")}
          >
            <NavPreviewIcon />
          </LeftNav>
        </li>
        <li>
          <LeftNav
            testid="settings"
            {...linkHelper({ route: `/settings`, id, activePathname, language })}
            onClick={saveForm}
            title={t("pageSettings")}
          >
            <NavSettingsIcon />
          </LeftNav>
        </li>
        {!isPublished && (
          <li>
            <LeftNav
              testid="publish"
              {...linkHelper({ route: "/publish", activePathname, language })}
              onClick={saveForm}
              title={t("publish")}
            >
              <NavPublishIcon />
            </LeftNav>
          </li>
        )}
        <li>
          <LeftNav
            testid="responses"
            {...linkHelper({ route: `/responses`, id, activePathname, language })}
            onClick={saveForm}
            title={t("responsesNavLabel")}
          >
            <NavResponsesIcon />
          </LeftNav>
        </li>
      </ul>
    </nav>
  );
};
