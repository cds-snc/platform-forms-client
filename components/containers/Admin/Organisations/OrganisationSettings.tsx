import React, { Fragment } from "react";
import { useTranslation } from "next-i18next";
import Head from "next/head";

export const OrganisationSettings = (props): React.ReactElement => {
  const { t } = useTranslation("organisations");
  const { organisation } = props;

  /*
  const jsonElements = props.templatesJSON.map(
    (template): React.ReactElement => {
      return <DataElement template={template} key={props.templatesJSON.indexOf(template)} />;
    }
  );
  */

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>

      <h1 className="gc-h1">{t("view.title")}</h1>
      <div>
        <p>{organisation.id}</p>
      </div>
    </>
  );
};

export default OrganisationSettings;
