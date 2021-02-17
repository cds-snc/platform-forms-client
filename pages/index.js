import React from "react";
import PropTypes from "prop-types";
import { Link, withTranslation } from "../i18n";
import { getFormByStatus, getFormByID } from "../lib/dataLayer.tsx";
import { getProperty } from "../lib/formBuilder";

const Home = ({ t, i18n }) => {
  const LinksList = () => {
    const formIDs = getFormByStatus(true);
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
      <div className="gc-homepage">
        <h1 className="gc-h1">{t("title")}</h1>
        <div>
          <h2>{t("product.title")}</h2>
          <p>{t("product.text")}</p>
        </div>

        <div>
          <h2>{t("formList.title")}</h2>
          <LinksList />
        </div>

        <div>
          <h2>{t("design.title")}</h2>
          <p className="mb-3">{t("design.text")}</p>
          <p>
            <a href="https://platform-storybook.herokuapp.com/">
              {t("design.system.title")}
            </a>
          </p>
        </div>

        <div>
          <h2>{t("technology.title")}</h2>
          <p className="mb-3">{t("technology.text")}</p>
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
Home.getInitialProps = async () => ({
  namespacesRequired: ["welcome"],
});

Home.propTypes = {
  t: PropTypes.func.isRequired,
  i18n: PropTypes.object.isRequired,
};

export default withTranslation("welcome")(Home);
