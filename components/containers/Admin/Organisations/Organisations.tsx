import React from "react";
import { useTranslation } from "next-i18next";
import Head from "next/head";

interface Organisation {
  id: string;
  organisationNameEn: string;
  organisationNameFr: string;
}

interface OrganisationsProps {
  organisations: Array<Organisation>;
}

export const Organisations = (props: OrganisationsProps): React.ReactElement => {
  const { t } = useTranslation("organisations");
  const { organisations } = props;
  console.log(organisations);

  const organisationsElements = organisations.map(
    (org): React.ReactElement => {
      return <li key={org.id}>{JSON.stringify(org)}</li>;
    }
  );

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>

      <h1 className="gc-h1">{t("view.title")}</h1>
      <ul className="organisations">{organisationsElements}</ul>
    </>
  );
};

export default Organisations;
