import React from "react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { Organisation } from "@lib/types";

interface OrganisationsProps {
  organisations: Array<Organisation>;
}

export const Organisations = (props: OrganisationsProps): React.ReactElement => {
  const { t, i18n } = useTranslation("organisations");
  const { organisations } = props;

  const organisationsElements = organisations.map(
    (org): React.ReactElement => {
      const orgLink = "./organisations/" + org.organisationID;
      return (
        <li key={org.organisationID}>
          <div className="pb-4 m-auto px-4 border-grey">
            <div className="width-full">
              {i18n.language === "en" ? org.organisationNameEn : org.organisationNameFr}
            </div>
            <a href={orgLink}>Edit Organisation</a>
          </div>
        </li>
      );
    }
  );

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>

      <h1 className="gc-h1">{t("title")}</h1>
      <ul className="organisations data_list">{organisationsElements}</ul>
    </>
  );
};

export default Organisations;
