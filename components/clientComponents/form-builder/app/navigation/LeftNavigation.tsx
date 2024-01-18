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
  const { activePathname } = useActivePathname();
  const { saveForm } = useTemplateContext();

  return (
    <nav aria-label={t("navLabelFormBuilder")}>
      <ul className="m-0 list-none p-0">
        {!isPublished && (
          <li>
            <LeftNav
              testid="edit"
              {...linkHelper("/edit", activePathname)}
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
            {...linkHelper("/preview", activePathname)}
            onClick={saveForm}
            title={t("test")}
          >
            <NavPreviewIcon />
          </LeftNav>
        </li>
        <li>
          <LeftNav
            testid="settings"
            {...linkHelper(`/settings/${id}`, activePathname)}
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
              {...linkHelper("/publish", activePathname)}
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
            {...linkHelper(`/responses/${id}`, activePathname)}
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
