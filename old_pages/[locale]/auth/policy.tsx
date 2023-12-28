import React, { ReactElement } from "react";
import { serverTranslation } from "@i18n";
import { useTranslation } from "@i18n/client";
import Head from "next/head";
import { AcceptableUseTerms } from "@clientComponents/auth/AcceptableUse";
import { requireAuthentication } from "@lib/auth";
import UserNavLayout from "@clientComponents/globals/layouts/UserNavLayout";

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
        destination: `/${locale}/forms`,
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
