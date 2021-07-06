import OrganizationSettings from "../../../components/containers/Admin/Organisations/OrganisationSettings";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "../../../lib/auth";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = requireAuthentication(async (context) => {
  const orgId = context.query.id;

  const orgData = {
    id: orgId,
  }; // get from lambda here

  return {
    props: {
      organisation: orgData,
      ...(await serverSideTranslations(context && context.locale ? context.locale : "", [
        "common",
        "organisations",
      ])),
    }, // will be passed to the page component as props
  };
});

export default OrganizationSettings;
