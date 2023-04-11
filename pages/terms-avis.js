import React from "react";
import PropTypes from "prop-types";
import { RichText } from "../components/forms/RichText/RichText";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const Terms = ({ content }) => (
  <>
    <RichText>{content}</RichText>
  </>
);

Terms.propTypes = {
  content: PropTypes.string.isRequired,
};

export const getStaticProps = async ({ locale }) => {
  const termsContent = await require(`../public/static/content/${locale}/terms.md`);
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      content: termsContent ?? null,
    },
  };
};
export default Terms;
