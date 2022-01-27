import React, { Fragment } from "react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { Organization } from "@lib/types";
import { DeleteButton } from "@components/forms";
import axios from "axios";
import { logMessage } from "@lib/logger";

interface OrganizationSettingsProps {
  organization: Organization;
}

const handleDelete = async (organizationID: string) => {
  // redirect to view templates page on success
  const resp = await axios({
    url: "/api/organizations",
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: {
      method: "DELETE",
      organizationID: organizationID,
    },
    timeout: 0,
  })
    .then((serverResponse) => {
      //success - redirect to organizations list page
      return serverResponse;
    })
    .catch((err) => {
      logMessage.error(err);
      return err;
    });
  return resp.status | resp;
};

export const OrganizationSettings = (props: OrganizationSettingsProps): React.ReactElement => {
  const { t, i18n } = useTranslation("organizations");
  const { organization } = props;

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
            ? organization.organizationNameEn
            : organization.organizationNameFr}
        </p>
      </div>
      <div>
        <p>
          {t("settings.id")}
          {organization.organizationID}
        </p>
      </div>
      <div>
        <DeleteButton
          action={handleDelete}
          data={organization.organizationID}
          redirect={`/admin/organizations`}
        ></DeleteButton>
      </div>
    </>
  );
};

export default OrganizationSettings;
