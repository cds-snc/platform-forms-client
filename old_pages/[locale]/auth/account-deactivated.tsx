import React, { ReactElement } from "react";
import { useTranslation } from "@i18n/client";
import Head from "next/head";
import { serverTranslation } from "@i18n";
import { GetServerSideProps } from "next";

import UserNavLayout from "@clientComponents/globals/layouts/UserNavLayout";
import { LinkButton } from "@clientComponents/globals";

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
  return <UserNavLayout contentWidth="tablet:w-[768px] laptop:w-[850px]">{page}</UserNavLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale = "en" }: { locale?: string } = context.params ?? {};
  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "deactivated"]))),
    },
  };
};

export default AccountDeactivated;
