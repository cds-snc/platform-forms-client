import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { checkPrivileges } from "@lib/privileges";

import React from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";

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
      <div className="flex mt-14">
        <Link href={`/${i18n.language}/unlock-publishing/`}>
          <a className="gc-button">{t("accountCreated.unlockPublishingButton")}</a>
        </Link>
        <Link href={`/${i18n.language}/myforms/`}>
          <a className="gc-button">{t("accountCreated.skipStepButton")}</a>
        </Link>
      </div>
    </>
  );
}

export const getServerSideProps = requireAuthentication(async ({ user: { ability }, locale }) => {
  {
    checkPrivileges(ability, [{ action: "view", subject: "FormRecord" }]);

    return {
      props: {
        ...(locale && (await serverSideTranslations(locale, ["signup", "common"]))),
      },
    };
  }
});
