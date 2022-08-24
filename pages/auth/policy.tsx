import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AcceptableUseTerms, AcceptableUseProps } from "@components/auth/AcceptableUse";
import { requireAuthentication } from "@lib/auth";

import { UserRole } from "@prisma/client";
interface TermsOfUse {
  content: string;
  // add needed properties only
  user: { lastLoginTime: Date | undefined; userId: string; authorizedForm: string | undefined };
}
const TermsOfUse = (props: TermsOfUse) => {
  const acceptableProps: AcceptableUseProps = {
    content: props.content,
    lastLoginTime: props.user.lastLoginTime,
    userId: props.user.userId,
    formID: props.user.authorizedForm,
  };
  return (
    <>
      <AcceptableUseTerms {...acceptableProps} />
    </>
  );
};

export const getServerSideProps = requireAuthentication(async (context) => {
  if (context.user?.acceptableUse) {
    return {
      redirect: {
        //redirect to retrieval page
        destination: `/${context.locale}/id/${context?.user?.authorizedForm}/retrieval`,
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
}, UserRole.PROGRAM_ADMINISTRATOR);

export default TermsOfUse;
