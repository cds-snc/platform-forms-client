import React from "react";
import ConfirmationBanner from "../components/globals/ConfirmationBanner.tsx";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

const Confirmation = () => {
  const { t } = useTranslation("confirmation");
  const router = useRouter();
  const urlQuery = router.query;
  const backToLink =
    urlQuery && urlQuery.referrerUrl ? <p className="gc-p">If you're finished, you can navigate <a href={urlQuery.referrerUrl}>{t("backLink")}</a>.</p> : null;

  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>

      <div>
        <ConfirmationBanner
          title={t("bannerTitle")}
          lightText={t("bannerLight")}
          boldText={t("bannerDark")}
        />
        <p className="gc-p">{t("body")} <a href="mailto:info@cds-snc.ca">info@cds-snc.ca</a>.</p>
        <div className="gc-form-confirmation">{backToLink}</div>
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
