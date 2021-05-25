import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getFormByStatus } from "../lib/dataLayer.tsx";
import { getProperty } from "../lib/formBuilder";

const Home = ({ formsList }) => {
  const { t, i18n } = useTranslation("welcome");
  const LinksList = () => {
    return formsList.map((form) => {
      return (
        <li key={`link-${form.formID}`}>
          <Link href={`/id/${form.formID}`} locale={i18n.language}>
            {form[getProperty("title", i18n.language)].toString()}
          </Link>
        </li>
      );
    });
  };

  return (
    <>
      <div className="gc-homepage">
        <h1 className="gc-h1">{t("title")}</h1>
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
          <h2>{t("design.title")}</h2>
          <p>{t("design.text")}</p>
          <ul className="link-list custom">
            <li>
              <a href="https://cds-snc.github.io/platform-forms-client/">
                {t("design.system.title")}
              </a>
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

Home.propTypes = {
  formsList: PropTypes.array.isRequired,
};
export async function getServerSideProps(context) {
  const formsList = await getFormByStatus(true);

  return {
    props: {
      formsList,
      ...(await serverSideTranslations(context.locale, ["common", "welcome"])),
    }, // will be passed to the page component as props
  };
}

export default Home;
