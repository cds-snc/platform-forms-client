import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "../../../lib/auth";
import { crudOrganizations } from "@lib/integration/crud";
import { GetServerSideProps } from "next";

import React from "react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { DeleteButton } from "@components/forms";
import axios from "axios";
import { logMessage } from "@lib/logger";
import { Organization } from "@lib/types";

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
    timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
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
        />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = requireAuthentication(async (context) => {
  const orgId = context.query.id as string;

  const payload = {
    method: "GET",
    organizationID: orgId,
  };

  const lambdaResult = await crudOrganizations(payload);

  if (context.locale && lambdaResult.data.records && lambdaResult.data.records.length > 0) {
    return {
      props: {
        organization: lambdaResult.data.records[0],
        ...(await serverSideTranslations(context && context.locale ? context.locale : "", [
          "common",
          "organizations",
          "admin-templates",
        ])),
      },
    };
  }
  // if no form returned, 404
  return {
    redirect: {
      // We can redirect to a 'Organization does not exist page' in the future
      destination: `/${context.locale}/404`,
      permanent: false,
    },
  };
});

export default OrganizationSettings;
