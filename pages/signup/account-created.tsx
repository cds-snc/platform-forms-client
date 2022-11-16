import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { checkPrivileges } from "@lib/privileges";

import React from "react";
import { useTranslation } from "next-i18next";
import { StyledLink } from "@components/globals/StyledLink/StyledLink";

export default function AccountCreated() {
  const { t, i18n } = useTranslation(["signup"]);

  return (
    <>
      <h1>{t("accountCreated.title")}</h1>
      <h2>{t("accountCreated.yourAccountTitle")}</h2>
      <p>{t("accountCreated.yourAccountListDescription")}:</p>
      <ul>
        <li>{t("accountCreated.yourAccountList.item1")}</li>
        <li>{t("accountCreated.yourAccountList.item2")}</li>
        <li>{t("accountCreated.yourAccountList.item3")}</li>
      </ul>
      <h2 className="mt-8">{t("accountCreated.notIncluded.title")}</h2>
      <p>{t("accountCreated.notIncluded.paragraph1")}</p>
      <h2 className="mt-8">{t("accountCreated.unlockPublishing.title")}</h2>
      <p>{t("accountCreated.unlockPublishing.paragraph1")}</p>
      <p className="mt-6">{t("accountCreated.unlockPublishing.paragraph2")}</p>
      <div className="mt-20">
        <StyledLink
          href={`/${i18n.language}/unlock-publishing/`}
          className={` 
            no-underline visited:text-white-default mr-8
            bg-blue-dark text-white-default border-black-default py-4 px-8 rounded-lg border-2 border-solid
            hover:text-white-default hover:bg-blue-light active:text-white-default active:bg-blue-active active:top-0.5
            focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:text-white-default disabled:cursor-not-allowed disabled:text-gray-500
          `}
        >
          {t("accountCreated.unlockPublishingButton")}
        </StyledLink>
        <StyledLink
          href={`/${i18n.language}/myforms/`}
          className={` 
            no-underline visited:text-black-default 
            bg-white-default text-black-default border-black-default py-4 px-8 rounded-lg border-2 border-solid
            hover:text-white-default hover:bg-blue-light active:text-white-default active:bg-blue-active active:top-0.5
            focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:text-white-default disabled:cursor-not-allowed disabled:text-gray-500
          `}
        >
          {t("accountCreated.skipStepButton")}
        </StyledLink>
      </div>
    </>
  );
}

export const getServerSideProps = requireAuthentication(async ({ user: { ability }, locale }) => {
  {
    checkPrivileges(ability, [{ action: "update", subject: "FormRecord", field: "isPublished" }]);

    return {
      props: {
        ...(locale && (await serverSideTranslations(locale, ["signup", "common"]))),
      },
    };
  }
});
