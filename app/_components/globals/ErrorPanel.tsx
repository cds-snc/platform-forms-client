"use client";
import React, { useState, useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";

import { LinkButton } from "@appComponents/globals/Buttons/LinkButton";
import { BackArrowIcon } from "@appComponents/form-builder/icons";

// Start the async call before the component renders
const getSessionPromise = getSession();

export const ErrorPanel = ({
  title,
  children,
  headingTag: HeadingTag = "h2",
}: {
  title?: string;
  children?: JSX.Element | string;
  headingTag?: "h1" | "h2";
}) => {
  const { t, i18n } = useTranslation("common");
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    getSessionPromise.then((session) => {
      setSession(session);
    });
  });

  // default content
  const defaultTitle = t("errorPanel.defaultTitle");
  const defaultMessage = <p>{t("errorPanel.defaultMessage")}</p>;

  // links
  const homeHref =
    session !== null
      ? `/${i18n.language}/myforms`
      : `https://articles.alpha.canada.ca/forms-formulaires/${
          String(i18n.language).toLowerCase() === "fr" ? "fr/" : ""
        }`;

  const homeText = session !== null ? t("errorPanel.cta.yourForms") : t("errorPanel.cta.home");

  const supportHref = `/${i18n.language}/form-builder/support`;

  return (
    <div className="flex items-center justify-center h-full mx-4">
      <div className="laptop:max-w-2xl py-10 px-12 border-2 border-solid border-blue bg-gray-soft rounded-2xl">
        <HeadingTag className="border-none mb-4">{title || defaultTitle}</HeadingTag>
        <div className="mb-10">{children || defaultMessage}</div>
        <div className="laptop:flex">
          <LinkButton.Primary href={homeHref} className="mr-3 mb-2">
            <span>
              <BackArrowIcon className="inline-block mr-2 fill-white self-stretch" />
              {homeText}
            </span>
          </LinkButton.Primary>
          <LinkButton.Secondary href={supportHref} className="mb-2">
            {t("errorPanel.cta.support")}
          </LinkButton.Secondary>
        </div>
      </div>
    </div>
  );
};
