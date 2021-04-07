import React from "react";
import parse from "html-react-parser";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { RichText } from "../components/forms";

const Confirmation = () => {
  const { t } = useTranslation("confirmation");
  const router = useRouter();
  const { urlQuery, htmlEmail, pageText } = router.query;

  const backToLink = urlQuery ? <a href={urlQuery}>{t("backLink")}</a> : null;

  const customPageText = pageText ? (
    <RichText className="confirmation">{JSON.parse(pageText)}</RichText>
  ) : null;

  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>

      <div>
        <p>{t("body")}</p>
      </div>

      <div className="gc-form-confirmation">{backToLink}</div>

      {customPageText ? customPageText : null}

      {htmlEmail ? (
        <div className="p-5 mt-5 border-double border-gray-400 border-4">
          <h2>Email to Form Owner Below:</h2>
          <div className="pt-5 email-preview">{parse(htmlEmail)}</div>
        </div>
      ) : null}
    </>
  );
};

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common", "confirmation"])),
  },
});

export default Confirmation;
