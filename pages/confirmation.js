import React from "react";
import parse from "html-react-parser";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

const Confirmation = () => {
  const { t } = useTranslation("confirmation");
  const router = useRouter();
  const { urlQuery, htmlEmail } = router.query;

  const backToLink = urlQuery ? <a href={urlQuery}>{t("backLink")}</a> : null;

  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>

      <div>
        <p>{t("body")}</p>
      </div>

      <div className="gc-form-confirmation">{backToLink}</div>

      {!process.env.PRODUCTION ? (
        <div>
          <h2>Email to Form Owner Below</h2>
          {parse(htmlEmail)}
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
