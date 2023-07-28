import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";

import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import { LinkButton } from "@components/globals";

const AccountDeactivated = () => {
  const { i18n, t } = useTranslation(["deactivated"]);
  const supportHref = `/${i18n.language}/form-builder/support`;

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <div>
        <h2 className="mt-4 mb-6 p-0">{t("title")}</h2>
        <p className="mb-10">{t("description")}</p>
        <div className="laptop:flex">
          <LinkButton.Primary href={supportHref} className="mb-2">
            {t("cta.label")}
          </LinkButton.Primary>
        </div>
      </div>
    </>
  );
};

AccountDeactivated.getLayout = (page: ReactElement) => {
  return <UserNavLayout contentWidth="laptop:w-[800px]">{page}</UserNavLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(context.locale &&
        (await serverSideTranslations(context.locale, ["common", "deactivated"]))),
    },
  };
};

export default AccountDeactivated;
