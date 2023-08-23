import React, { ReactElement } from "react";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Head from "next/head";

import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import { LinkButton } from "@components/globals";

const ResetLink = () => {
  const { t, i18n } = useTranslation(["reset-password"]);
  const continueHref = `/${i18n.language}/`;

  return (
    <>
      <Head>
        <title>{t("magicLink.title")}</title>
      </Head>
      <div>
        <h2 className="mt-4 mb-6 p-0">{t("magicLink.title")}</h2>
        <p className="mb-10">{t("magicLink.description")}</p>
        <div className="laptop:flex">
          <LinkButton.Primary href={continueHref} className="mb-2">
            {t("magicLink.cta.label")}
          </LinkButton.Primary>
        </div>
      </div>
    </>
  );
};

ResetLink.getLayout = (page: ReactElement) => {
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

export default ResetLink;
