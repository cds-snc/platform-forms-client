import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";

import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import { LinkButton } from "@components/globals";

const SecurityQuestions = () => {
  const { i18n, t } = useTranslation(["deactivated"]);
  const supportHref = `/${i18n.language}/form-builder/support`;

  return (
    <>
      <Head>
        <title>Setup Security Questions</title>
      </Head>
      <div>
        <h2 className="mt-4 mb-6 p-0">Setup Security Questions</h2>
        <p className="mb-10">todo</p>
        <div className="laptop:flex">
          <LinkButton.Primary href={supportHref} className="mb-2">
            {t("cta.label")}
          </LinkButton.Primary>
        </div>
      </div>
    </>
  );
};

SecurityQuestions.getLayout = (page: ReactElement) => {
  return <UserNavLayout>{page}</UserNavLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(context.locale &&
        (await serverSideTranslations(context.locale, ["common", "deactivated"]))),
    },
  };
};

export default SecurityQuestions;
