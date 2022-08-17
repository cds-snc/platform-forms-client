import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useSession } from "next-auth/react";
import { requireAuthentication } from "@lib/auth";
import { AcceptableUseTerms, AcceptableUseProps } from "@components/auth/AcceptableUse";
import { UserRole } from "@prisma/client";
interface TermsOfUse {
  content: string;
}
const TermsOfUse = (props: TermsOfUse) => {
  const { data: session } = useSession();
  const userId = session?.user?.userId ?? "";
  const lastLoginTime = session?.user?.lastLoginTime ?? "";
  const { content } = props;

  const acceptableProps: AcceptableUseProps = { content, lastLoginTime, userId };
  return (
    <>
      <AcceptableUseTerms {...acceptableProps} />
    </>
  );
};

export const getServerSideProps = requireAuthentication(async (context) => {
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
