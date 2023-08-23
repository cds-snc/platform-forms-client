import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";

import React, { ReactElement } from "react";
import Head from "next/head";
import { useTranslation } from "next-i18next";
import { StyledLink } from "@components/globals/StyledLink/StyledLink";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";

export default function AccountCreated() {
  const { t, i18n } = useTranslation(["signup"]);

  return (
    <>
      <Head>
        <title>{t("accountCreated.title")}</title>
      </Head>
      <h1 className="border-b-0 mt-6 mb-12">{t("accountCreated.title")}</h1>
      <h2>{t("accountCreated.yourAccountListDescription")}</h2>
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
          theme="primaryButton"
          className="mr-4"
        >
          {t("accountCreated.unlockPublishingButton")}
        </StyledLink>
        <StyledLink
          href={`/${i18n.language}/myforms/`}
          theme="secondaryButton"
          testid="skipStepButton"
        >
          {t("accountCreated.skipStepButton")}
        </StyledLink>
      </div>
    </>
  );
}

AccountCreated.getLayout = (page: ReactElement) => {
  return <UserNavLayout contentWidth="tablet:w-[658px]">{page}</UserNavLayout>;
};

export const getServerSideProps = requireAuthentication(async (params) => {
  {
    const { locale = "en" }: { locale?: string } = params ?? {};
    return {
      props: {
        ...(locale && (await serverSideTranslations(locale, ["signup", "common"]))),
      },
    };
  }
});
