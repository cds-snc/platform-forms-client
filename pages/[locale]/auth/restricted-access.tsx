import React, { ReactElement } from "react";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import Link from "next/link";

import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import { LinkButton } from "@components/globals";

const AccountDeactivated = () => {
  const { t, i18n } = useTranslation(["restricted-access"]);
  const continueHref = `/${i18n.language}/form-builder`;

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <div>
        <h2 className="mt-4 mb-6 p-0">{t("title")}</h2>
        <p className="mb-10">{t("text1")}</p>
        <p className="mb-10">
          {t("text2")} <Link href={`/${i18n.language}/terms-of-use`}>{t("text3")}</Link>{" "}
          {t("text4")}
        </p>
        <div className="laptop:flex">
          <LinkButton.Primary href={continueHref} className="mb-2">
            {t("cta.label")}
          </LinkButton.Primary>
        </div>
      </div>
    </>
  );
};

AccountDeactivated.getLayout = (page: ReactElement) => {
  return <UserNavLayout contentWidth="tablet:w-[768px] laptop:w-[850px]">{page}</UserNavLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(context.locale &&
        (await serverSideTranslations(context.locale, ["common", "restricted-access"]))),
    },
  };
};

export default AccountDeactivated;
