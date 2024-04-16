"use client";
import { useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { BackArrowIcon } from "@serverComponents/icons";

export const Locked2fa = () => {
  const { t, i18n } = useTranslation(["cognito-errors", "common"]);
  const homeHref = `/${i18n.language}/auth/login`;
  const supportHref = `/${i18n.language}/support`;

  useEffect(() => {
    sessionStorage.removeItem("authFlowToken");
  }, []);

  return (
    <div>
      <h2 className="mb-6 mt-4 p-0">{t("2FALockedOutSession.title")}</h2>
      <p className="mb-10">{t("2FALockedOutSession.description")}</p>
      <div className="laptop:flex">
        <LinkButton.Primary href={homeHref} className="mb-2 mr-3">
          <span>
            <BackArrowIcon className="mr-2 inline-block self-stretch fill-white" />
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
