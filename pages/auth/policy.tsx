import React from "react";
import PropTypes from "prop-types";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useSession } from "next-auth/react";
import { requireAuthentication } from "@lib/auth";
import AcceptableUseTerms from "@components/auth/AcceptableUse";

const TermsOfUse = (props) => {
  const { data: session } = useSession();
  const userId = session?.user.userId;
  const lastLoginTime = session?.user.lastLoginTime;

  const acceptableProps = { ...props, lastLoginTime, userId };
  return (
    <>
      <AcceptableUseTerms {...acceptableProps} />
    </>
  );
};

TermsOfUse.propTypes = {
  content: PropTypes.string.isRequired,
};

export const getStaticProps = requireAuthentication(async ({ locale }) => {
  const termsOfUseContent = await require(`../../public/static/content/${locale}/terms-of-use.md`);
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      content: termsOfUseContent ?? null,
    },
  };
});
export default TermsOfUse;
