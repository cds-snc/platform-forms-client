"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import {
  NavEditIcon,
  NavPreviewIcon,
  NavPublishIcon,
  NavSettingsIcon,
  NavResponsesIcon,
} from "@serverComponents/icons";
import { useTemplateStore } from "../../store/useTemplateStore";
import { LeftNav } from "@clientComponents/globals/Buttons/LinkButton";
import { useSelectedLayoutSegment } from "next/navigation";

const linkHelper = ({
  route,
  segment,
  id,
  language,
}: {
  route: string;
  segment: string | null;
  id?: string;
  language: string;
}) => {
  return {
    href: `/${language}/form-builder${id ? `/${id}` : ""}/${route}`,
    isActive: segment ? route.includes(segment) : false,
  };
};

export const LeftNavigation = ({ id }: { id: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("form-builder");
  const { isPublished, id: storeId } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
    id: s.id,
  }));

  if (storeId && storeId !== id) {
    id = storeId;
  }

  const segment = useSelectedLayoutSegment();

  return (
    <nav aria-label={t("navLabelFormBuilder")}>
      <ul className="m-0 list-none p-0">
        {!isPublished && (
          <li>
            <LeftNav
              testid="edit"
              {...linkHelper({ route: "edit", id, segment, language })}
              title={t("edit")}
            >
              <NavEditIcon />
            </LeftNav>
          </li>
        )}
        <li>
          <LeftNav
            testid="preview"
            {...linkHelper({ route: "preview", id, segment, language })}
            title={t("test")}
          >
            <NavPreviewIcon />
          </LeftNav>
        </li>
        <li>
          <LeftNav
            testid="settings"
            {...linkHelper({ route: `settings`, id, segment, language })}
            title={t("pageSettings")}
          >
            <NavSettingsIcon />
          </LeftNav>
        </li>
        {!isPublished && (
          <li>
            <LeftNav
              testid="publish"
              {...linkHelper({ route: "publish", id, segment, language })}
              title={t("publish")}
            >
              <NavPublishIcon />
            </LeftNav>
          </li>
        )}
        <li>
          <LeftNav
            testid="responses"
            {...linkHelper({ route: `responses/new`, id, segment, language })}
            title={t("responsesNavLabel")}
          >
            <NavResponsesIcon />
          </LeftNav>
        </li>
      </ul>
    </nav>
  );
};
