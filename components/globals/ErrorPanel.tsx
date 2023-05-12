import React from "react";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";

import { LinkButton } from "@components/globals";
import { BackArrowIcon } from "@components/form-builder/icons";

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
  const { status } = useSession();

  // default content
  const defaultTitle = t("errorPanel.defaultTitle");
  const defaultMessage = <p>{t("errorPanel.defaultMessage")}</p>;

  // links
  const homeHref =
    status === "authenticated" ? `/${i18n.language}/myforms` : `/${i18n.language}/form-builder`;

  const homeText =
    status === "authenticated" ? t("errorPanel.cta.yourForms") : t("errorPanel.cta.home");

  const supportHref = `/${i18n.language}/form-builder/support`;

  return (
    <div className="flex items-center justify-center h-full mx-4">
      <div className="inline-block py-10 px-12 border-2 border-solid border-blue rounded-md max-w-xl bg-gray-soft">
        <HeadingTag className="border-none mb-4">{title || defaultTitle}</HeadingTag>
        <div className="mb-10">{children || defaultMessage}</div>
        <div>
          <LinkButton.Primary href={homeHref} className="mr-3 mb-2">
            <span>
              <BackArrowIcon className="inline-block mr-2 fill-white " />
              {homeText}
            </span>
          </LinkButton.Primary>
          <LinkButton.Secondary href={supportHref}>
            {t("errorPanel.cta.support")}
          </LinkButton.Secondary>
        </div>
      </div>
    </div>
  );
};
