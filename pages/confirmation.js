import React from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

const Confirmation = () => {
  const { t } = useTranslation("confirmation");
  const router = useRouter();
  const urlQuery = router.query;
  const backToLink =
    urlQuery && urlQuery.referrerUrl ? <a href={urlQuery.referrerUrl}>{t("backLink")}</a> : null;

  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>

      <div>
        <p>{t("body")}</p>
      </div>

      <div className="gc-form-confirmation">{backToLink}</div>
    </>
  );
};

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common", "confirmation"])),
  },
});

export default Confirmation;
