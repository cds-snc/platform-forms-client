import React from "react";
import parse from "html-react-parser";
import ConfirmationBanner from "../components/globals/ConfirmationBanner.tsx";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

const Confirmation = () => {
  const { t } = useTranslation("confirmation");
  const router = useRouter();
  const { urlQuery, htmlEmail } = router.query;
  const backToLink = urlQuery ? <p>{t("linkSentence")}<a href={urlQuery}>{t("backLink")}</a>.</p> : null;

  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>

      <div>
        <ConfirmationBanner
          title={t("bannerTitle")}
          lightText={t("bannerLight")}
          boldText={t("bannerDark")}
        />
        <div className="confirmation-content">
          <div className="gc-form-confirmation">{backToLink}</div>
        </div>
        {htmlEmail ? (
          <div className="p-5 mt-5 border-double border-gray-400 border-4">
            <h2>Email to Form Owner Below:</h2>
            <div className="pt-5 email-preview">{parse(htmlEmail)}</div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common", "confirmation"])),
  },
});

export default Confirmation;
