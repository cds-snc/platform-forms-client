import React from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getFormByStatus, getFormByID } from "../lib/dataLayer.tsx";
import { getProperty } from "../lib/formBuilder";

const Sandbox = () => {
  const { t, i18n } = useTranslation("welcome");
  const LinksList = () => {
    const formIDs = getFormByStatus(false);
    return formIDs.map((formID) => {
      const form = getFormByID(formID);
      return (
        <li key={`link-${form.id}`}>
          <Link href={`/${form.id}`}>{form[getProperty("title", i18n.language)].toString()}</Link>
        </li>
      );
    });
  };

  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>

      <div className="gc-homepage">
        <div>
          <h2>{t("product.title")}</h2>
          <p>{t("product.text")}</p>
        </div>
        <div>
          <h2>{t("formList.title")}</h2>
          <ul className="link-list custom">
            <LinksList />
          </ul>
        </div>

        <div>
          <h2>{t("product.preview.title")}</h2>
          <ul className="link-list custom">
            <li>
              <Link href="/builder-preview">{t("product.preview.link")}</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2>{t("design.title")}</h2>
          <p>{t("design.text")}</p>
          <ul className="link-list custom">
            <li>
              <a href="https://platform-storybook.herokuapp.com/">{t("design.system.title")}</a>
            </li>
          </ul>
        </div>

        <div>
          <h2>{t("technology.title")}</h2>
          <p>{t("technology.text")}</p>
          <ul className="link-list custom">
            <li>
              <a href="https://github.com/cds-snc/platform-forms-node/">
                {t("technology.git.title")}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common", "welcome"])),
  },
});

export default Sandbox;
