import React, { useRef } from "react";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";

import { LinkButton } from "@components/globals";
import { BackArrowIcon } from "@components/form-builder/icons";
import { useFocusIt } from "@lib/hooks/useFocusIt";

export const ErrorPanel = ({
  title,
  children,
  headingTag: HeadingTag = "h2",
  supportLink = true,
}: {
  title?: string;
  children?: JSX.Element | string;
  headingTag?: "h1" | "h2";
  supportLink?: boolean;
}) => {
  const { t, i18n } = useTranslation("common");
  const { status } = useSession();
  const headingRef = useRef(null);

  // default content
  const defaultTitle = t("errorPanel.defaultTitle");
  const defaultMessage = <p>{t("errorPanel.defaultMessage")}</p>;

  // links
  const homeHref =
    status === "authenticated"
      ? `/${i18n.language}/myforms`
      : `https://articles.alpha.canada.ca/forms-formulaires/${
          String(i18n.language).toLowerCase() === "fr" ? "fr/" : ""
        }`;

  const homeText =
    status === "authenticated" ? t("errorPanel.cta.yourForms") : t("errorPanel.cta.home");

  const supportHref = `/${i18n.language}/form-builder/support`;

  useFocusIt({ elRef: headingRef });

  return (
    <div className="mx-4 flex h-full items-center justify-center">
      <div className="rounded-2xl border-2 border-solid border-blue bg-gray-soft px-12 py-10 laptop:max-w-2xl">
        <HeadingTag className="mb-4 border-none" ref={headingRef}>
          {title || defaultTitle}
        </HeadingTag>
        <div className="mb-10">{children || defaultMessage}</div>
        <div className="laptop:flex">
          <LinkButton.Primary href={homeHref} className="mb-2 mr-3">
            <span>
              <BackArrowIcon className="mr-2 inline-block self-stretch fill-white" />
              {homeText}
            </span>
          </LinkButton.Primary>
          {supportLink && (
            <LinkButton.Secondary href={supportHref} className="mb-2">
              {t("errorPanel.cta.support")}
            </LinkButton.Secondary>
          )}
        </div>
      </div>
    </div>
  );
};
