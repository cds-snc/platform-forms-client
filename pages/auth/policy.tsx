import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AcceptableUseTerms, AcceptableUseProps } from "@components/auth/AcceptableUse";
import { requireAuthentication } from "@lib/auth";

import { Session } from "next-auth";
interface TermsOfUse {
  content: string;
  user: Session["user"];
}
const TermsOfUse = ({ content }: TermsOfUse) => {
  return (
    <>
      <AcceptableUseTerms content={content} />
    </>
  );
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
    },
  };
});

export default TermsOfUse;
