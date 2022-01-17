import OrganizationSettings from "../../../components/containers/Admin/Organizations/OrganizationSettings";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "../../../lib/auth";
import { crudOrganizations } from "@lib/integration/crud";
import { GetServerSideProps } from "next";

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
