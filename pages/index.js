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
        <h2 className="text-3xl mb-5">{t("formList.title")}</h2>
        <p>
          <Link href="/14">{t("formList.a11yfunding")}</Link>
        </p>
        <p>
          <Link href="/8">{t("formList.esdc")}</Link>
        </p>
        <p>
          <Link href="/9">{t("formList.clearance")}</Link>
        </p>
        <p>
          <Link href="/18">{t("formList.callback")}</Link>
        </p>
        <p>
          <Link href="/1">{t("formList.intake")}</Link>
        </p>
        <p>
          <Link href="/12">{t("formList.notifycontact")}</Link>
        </p>
        <p>
          <Link href="/3">{t("formList.award")}</Link>
        </p>
        <p>
          <Link href="/4">{t("formList.baggage")}</Link>
        </p>
        <p>
          <Link href="/5">{t("formList.lostfishgear")}</Link>
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
