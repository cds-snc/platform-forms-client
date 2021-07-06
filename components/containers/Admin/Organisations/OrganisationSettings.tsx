import React, { Fragment } from "react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { Organisation } from "@lib/types";
import { DeleteButton } from "../../../forms/Button/DeleteButton";
import axios from "axios";

interface OrganisationSettingsProps {
  organisation: Organisation;
}

const handleDelete = async (organisationID: string) => {
  // redirect to view templates page on success
  const resp = await axios({
    url: "/api/organisations",
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: {
      method: "DELETE",
      organisationID: organisationID,
    },
    timeout: 0,
  })
    .then((serverResponse) => {
      //success - redirect to view-templates page
      return serverResponse;
    })
    .catch((err) => {
      console.error(err);
      return err;
    });
  return resp.status;
};

export const OrganisationSettings = (props: OrganisationSettingsProps): React.ReactElement => {
  const { t, i18n } = useTranslation("organisations");
  const { organisation } = props;

  return (
    <>
      <Head>
        <title>{t("settings.title")}</title>
      </Head>

      <h1 className="gc-h1">{t("settings.title")}</h1>
      <div>
        <p>
          {t("settings.name")}
          {i18n.language === "en"
            ? organisation.organisationNameEn
            : organisation.organisationNameFr}
        </p>
      </div>
      <div>
        <p>
          {t("settings.id")}
          {organisation.organisationID}
        </p>
      </div>
      <div>
        <DeleteButton
          action={handleDelete}
          data={organisation.organisationID}
          redirect={`/admin/organisations`}
        ></DeleteButton>
      </div>
    </>
  );
};

export default OrganisationSettings;
