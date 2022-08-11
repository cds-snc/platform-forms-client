import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";
import { RichText } from "../../components/forms/RichText/RichText";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useSession } from "next-auth/react";
import { logMessage } from "@lib/logger";
import axios from "axios";
import AcceptableUseTerms from "@components/auth/AcceptableUse";

const TermsOfUse = (props) => {
  const { data: session } = useSession();
  const userId = session?.user.userId;
  const lastLoginTime = session?.user.lastLoginTime;

  const propss = { ...props, lastLoginTime, userId };
  return (
    <>
      <AcceptableUseTerms {...propss} />
    </>
  );
};

TermsOfUse.propTypes = {
  content: PropTypes.string.isRequired,
};

export const getStaticProps = async ({ locale }) => {
  const termsOfUseContent = await require(`../../public/static/content/${locale}/terms-of-use.md`);
  //const { data: session } = useSession();
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      content: termsOfUseContent ?? null,
    },
  };
};
export default TermsOfUse;
