import React from "react";
import { useTranslation } from "next-i18next";

import { LinkButton } from "@components/globals";
import { BackArrowIcon } from "@components/form-builder/icons";

export const Locked2fa = () => {
  const { t, i18n } = useTranslation(["cognito-errors", "common"]);
  const homeHref = `/${i18n.language}/auth/login`;
  const supportHref = `/${i18n.language}/form-builder/support`;

  return (
    <div>
      <h2 className="mt-4 mb-6 p-0">{t("2FALockedOutSession.title")}</h2>
      <p className="mb-10">{t("2FALockedOutSession.description")}</p>
      <div className="laptop:flex">
        <LinkButton.Primary href={homeHref} className="mr-3 mb-2">
          <span>
            <BackArrowIcon className="inline-block mr-2 fill-white self-stretch" />
            {t("account.actions.backToSignIn", { ns: "common" })}
          </span>
        </LinkButton.Primary>
        <LinkButton.Secondary href={supportHref} className="mb-2">
          {t("errorPanel.cta.support", { ns: "common" })}
        </LinkButton.Secondary>
      </div>
    </div>
  );
};
