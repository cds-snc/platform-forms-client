import React, { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { AcceptableUseTerms } from "@components/auth/AcceptableUse";
import { requireAuthentication } from "@lib/auth";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";

import { Session } from "next-auth";
interface TermsOfUse {
  content: string;
  user: Session["user"];
  referer?: string;
}

const TermsOfUse = ({ content, referer }: TermsOfUse) => {
  const { t } = useTranslation(["policy", "common"]);
  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <AcceptableUseTerms content={content} referer={referer} />
    </>
  );
};

TermsOfUse.getLayout = (page: ReactElement) => {
  return <UserNavLayout contentWidth="tablet:w-[768px] laptop:w-[850px]">{page}</UserNavLayout>;
};

export const getServerSideProps = requireAuthentication(async (context) => {
  const { locale = "en" }: { locale?: string } = context.params ?? {};
  if (context.user?.acceptableUse) {
    return {
      redirect: {
        //redirect to user landing page
        destination: `/${locale}/myforms`,
        permanent: false,
      },
    };
  }

  const termsOfUseContent =
    await require(`../../../public/static/content/${locale}/responsibilities.md`);
  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "policy"]))),
      content: termsOfUseContent ?? null,
      ...(context.query.referer && { referer: context.query.referer }),
    },
  };
});

export default TermsOfUse;
