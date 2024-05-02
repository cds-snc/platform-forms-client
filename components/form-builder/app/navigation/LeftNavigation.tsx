import React from "react";
import { useTranslation } from "next-i18next";
import {
  NavEditIcon,
  NavPreviewIcon,
  NavPublishIcon,
  NavSettingsIcon,
  NavResponsesIcon,
} from "../../icons";
import { useTemplateContext } from "@components/form-builder/hooks";
import { useTemplateStore } from "../../store/useTemplateStore";
import { useActivePathname, cleanPath } from "../../hooks/useActivePathname";
import { LinkButton } from "@components/globals";

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
  const { activePathname } = useActivePathname();
  const { saveForm } = useTemplateContext();

  return (
    <nav aria-label={t("navLabelFormBuilder")}>
      <ul className="m-0 list-none p-0">
        {!isPublished && (
          <li>
            <LinkButton.LeftNav
              testid="edit"
              {...linkHelper("/edit", activePathname)}
              onClick={saveForm}
              title={t("edit")}
            >
              <NavEditIcon />
            </LinkButton.LeftNav>
          </li>
        )}
        <li>
          <LinkButton.LeftNav
            testid="preview"
            {...linkHelper("/preview", activePathname)}
            onClick={saveForm}
            title={t("test")}
          >
            <NavPreviewIcon />
          </LinkButton.LeftNav>
        </li>
        <li>
          <LinkButton.LeftNav
            testid="settings"
            {...linkHelper(`/settings/${id}`, activePathname)}
            onClick={saveForm}
            title={t("pageSettings")}
          >
            <NavSettingsIcon />
          </LinkButton.LeftNav>
        </li>
        {!isPublished && (
          <li>
            <LinkButton.LeftNav
              testid="publish"
              {...linkHelper("/publish", activePathname)}
              onClick={saveForm}
              title={t("publish")}
            >
              <NavPublishIcon />
            </LinkButton.LeftNav>
          </li>
        )}
        <li>
          <LinkButton.LeftNav
            testid="responses"
            {...linkHelper(`/responses/${id}`, activePathname)}
            onClick={saveForm}
            title={t("responsesNavLabel")}
          >
            <NavResponsesIcon />
          </LinkButton.LeftNav>
        </li>
      </ul>
    </nav>
  );
};
