import OrganizationSettings from "../../../components/containers/Admin/Organisations/OrganisationSettings";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "../../../lib/auth";
import { crudOrganisations } from "@lib/dataLayer";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = requireAuthentication(async (context) => {
  const orgId = context.query.id;

  const payload = {
    method: "GET",
    id: orgId,
  };

  const lambdaResult = await crudOrganisations(payload);

  if (context.locale && lambdaResult.data.records && lambdaResult.data.records.length > 0) {
    return {
      props: {
        organisation: lambdaResult.data.records[0],
        ...(await serverSideTranslations(context && context.locale ? context.locale : "", [
          "common",
          "organisations",
          "admin-templates",
        ])),
      },
    };
  }
  // if no form returned, 404
  return {
    redirect: {
      // We can redirect to a 'Organisation does not exist page' in the future
      destination: `/${context.locale}/404`,
      permanent: false,
    },
  };
});

export default OrganizationSettings;
