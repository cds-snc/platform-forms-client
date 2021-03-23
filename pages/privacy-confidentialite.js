import React from "react";
import PropTypes from "prop-types";
import { RichText } from "../components/forms/RichText/RichText";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const Privacy = ({ content }) => (
  <>
    <RichText>{content}</RichText>
  </>
);

Privacy.propTypes = {
  content: PropTypes.string.isRequired,
};

export const getStaticProps = async ({ locale }) => {
  const privacyContent = await require(`../public/static/content/${locale}/privacy.md`);
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      content: privacyContent.default,
    },
  };
};
export default Privacy;
