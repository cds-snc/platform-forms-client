import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";
import { RichText } from "../../components/forms/RichText/RichText";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useSession } from "next-auth/react";

const TermsOfUse = ({ content }) => {
  const { t } = useTranslation("common");
  const { data: session } = useSession();

  return (
    <>
      <div className="gc-acceptance-header">
        <h1>{t("acceptanceUsePage.welcome")}</h1>
        <span>
          {t("acceptanceUsePage.lastLoginTime")} : {session?.user?.name}
        </span>
      </div>
      <RichText className="gc-acceptance-content">{content}</RichText>
      <div className="gc-acceptance-use-control-btn">
        <button type="button" className="gc-agree-btn">
          {" "}
          {t("acceptanceUsePage.agree")}
        </button>
        <button type="button" className="gc-cancel-btn">
          {" "}
          {t("acceptanceUsePage.cancel")}
        </button>
      </div>
    </>
  );
};

TermsOfUse.propTypes = {
  content: PropTypes.string.isRequired,
};

export const getStaticProps = async ({ locale }) => {
  const termsOfUseContent = await require(`../../public/static/content/${locale}/terms-of-use.md`);
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      content: termsOfUseContent ?? null,
    },
  };
};
export default TermsOfUse;
