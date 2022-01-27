import React from "react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { Organization } from "@lib/types";

interface OrganizationsProps {
  organizations: Array<Organization>;
}

export const Organizations = (props: OrganizationsProps): React.ReactElement => {
  const { t, i18n } = useTranslation("organizations");
  const { organizations } = props;

  const organizationsElements = organizations.map((org): React.ReactElement => {
    const orgLink = "./organizations/" + org.organizationID;
    return (
      <li key={org.organizationID}>
        <div className="pb-4 m-auto px-4 border-grey">
          <div className="width-full">
            {i18n.language === "en" ? org.organizationNameEn : org.organizationNameFr}
          </div>
          <a href={orgLink}>Edit Organization</a>
        </div>
      </li>
    );
  });

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>

      <h1 className="gc-h1">{t("title")}</h1>
      <ul className="organizations data_list">{organizationsElements}</ul>
    </>
  );
};

export default Organizations;
