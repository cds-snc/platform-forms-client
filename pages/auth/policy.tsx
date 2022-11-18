import React, { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
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
  return (
    <>
      <AcceptableUseTerms content={content} referer={referer} />
    </>
  );
};

TermsOfUse.getLayout = (page: ReactElement) => {
  return <UserNavLayout>{page}</UserNavLayout>;
};

export const getServerSideProps = requireAuthentication(async (context) => {
  if (context.user?.acceptableUse) {
    return {
      redirect: {
        //redirect to user landing page
        destination: `/${context.locale}/myforms`,
        permanent: false,
      },
    };
  }

  const termsOfUseContent =
    await require(`../../public/static/content/${context?.locale}/terms-of-use.md`);
  return {
    props: {
      ...(context.locale && (await serverSideTranslations(context?.locale, ["common"]))),
      content: termsOfUseContent ?? null,
      ...(context.query.referer && { referer: context.query.referer }),
    },
  };
});

export default TermsOfUse;
