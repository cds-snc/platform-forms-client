import React from "react";
import PropTypes from "prop-types";
import { Link, withTranslation } from "../i18n";

const Home = ({ t }) => (
  <>
    <h1>{t("title")}</h1>

    <div className="">
      <div className="mb-20">
        <h2 className="text-3xl mb-5">{t("product.title")}</h2>
        <p>{t("product.text")}</p>
        <p>
          <Link href="/1">{t("intake.title")}</Link>
        </p>
        <p>
          <Link href="/3">{t("formList.award.title")}</Link>
        </p>
        <p>
          <Link href="/4">{t("formList.baggage.title")}</Link>
        </p>
        <p>
          <Link href="/5">{t("formList.lostfishgear.title")}</Link>
        </p>
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

Home.getInitialProps = async () => ({
  namespacesRequired: ["welcome"],
});

Home.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation("welcome")(Home);
