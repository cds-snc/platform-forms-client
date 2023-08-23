import React, { ReactElement } from "react";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Head from "next/head";

import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import { LinkButton } from "@components/globals";
import { BackArrowIcon } from "@components/form-builder/icons";

export const InvalidMagicLink = () => {
  const { t, i18n } = useTranslation(["reset-password", "common"]);
  const homeHref = `/${i18n.language}/auth/login`;
  const supportHref = `/${i18n.language}/form-builder/support`;

  return (
    <>
      <Head>
        <title>{t("errorPanel.defaultTitle")}</title>
      </Head>
      <div>
        <h2 className="mb-6 mt-4 p-0" data-testid="session-expired">
          {t("errorPanel.defaultTitle")}
        </h2>
        <p className="mb-10">{t("errorPanel.defaultMessage")}</p>
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
    </>
  );
};

InvalidMagicLink.getLayout = (page: ReactElement) => {
  return <UserNavLayout contentWidth="tablet:w-[768px] laptop:w-[850px]">{page}</UserNavLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale = "en" }: { locale?: string } = context.params ?? {};
  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "reset-password"]))),
    },
  };
};

export default InvalidMagicLink;
