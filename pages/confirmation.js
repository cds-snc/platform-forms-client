import React from "react";
<<<<<<< HEAD
import parse from "html-react-parser";
=======
>>>>>>> 8177aedbf7fce67d6d73ab931feba335476f570e
import ConfirmationBanner from "../components/globals/ConfirmationBanner.tsx";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

const Confirmation = () => {
  const { t } = useTranslation("confirmation");
  const router = useRouter();
<<<<<<< HEAD
  const { urlQuery, htmlEmail } = router.query;
  const backToLink = urlQuery ? <p>{t("linkSentence")}<a href={urlQuery}>{t("backLink")}</a>.</p> : null;
=======
  const urlQuery = router.query;
  const backToLink =
    urlQuery && urlQuery.referrerUrl ? (
      <p>
        {t("linkSentence")} <a href={urlQuery.referrerUrl}>{t("backLink")}</a>.
      </p>
    ) : null;
>>>>>>> 8177aedbf7fce67d6d73ab931feba335476f570e

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
<<<<<<< HEAD
        {htmlEmail ? (
          <div className="p-5 mt-5 border-double border-gray-400 border-4">
            <h2>Email to Form Owner Below:</h2>
            <div className="pt-5 email-preview">{parse(htmlEmail)}</div>
          </div>
        ) : null}
=======
>>>>>>> 8177aedbf7fce67d6d73ab931feba335476f570e
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
