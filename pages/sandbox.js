import React from "react";
import PropTypes from "prop-types";
import { Link, withTranslation } from "../i18n";
import { getFormByStatus, getFormByID } from "../lib/dataLayer.tsx";
import { getProperty } from "../lib/formBuilder";

const Sandbox = ({ t, i18n }) => {
  const LinksList = () => {
    const formIDs = getFormByStatus(false);
    return formIDs.map((formID) => {
      const form = getFormByID(formID);
      return (
        <p key={`link-${form.id}`}>
          <Link href={`/${form.id}`}>
            {form[getProperty("title", i18n.language)].toString()}
          </Link>
        </p>
      );
    });
  };

  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>

      <div className="">
        <div className="mb-20">
          <h2 className="text-3xl mb-5">{t("product.title")}</h2>
          <p>{t("product.text")}</p>
          <h2 className="text-3xl mt-10 mb-5">{t("formList.title")}</h2>
          <LinksList />

          <h2 className="text-3xl mt-10 mb-5">{t("product.preview.title")}</h2>
          <Link href="/builder-preview">{t("product.preview.link")}</Link>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl mb-5">{t("design.title")}</h2>
          <p>{t("design.text")}</p>
          <p>
            <a href="https://platform-storybook.herokuapp.com/">
              {t("design.system.title")}
            </a>
          </p>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl mb-5">{t("technology.title")}</h2>
          <p>{t("technology.text")}</p>
          <p>
            <a href="https://github.com/cds-snc/platform-forms-node/">
              {t("technology.git.title")}
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

Sandbox.getInitialProps = async () => ({
  namespacesRequired: ["welcome"],
});

Sandbox.propTypes = {
  t: PropTypes.func.isRequired,
  i18n: PropTypes.object.isRequired,
};

export default withTranslation("welcome")(Sandbox);
