import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { requireAuthentication } from "../../../lib/auth";
import { CreateOrganisation } from "../../../components/containers/Admin/Organisations/CreateOrganisation";

export const getServerSideProps: GetServerSideProps = requireAuthentication(async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context && context.locale ? context.locale : "", [
        "common",
        "organisations",
      ])),
    }, // will be passed to the page component as props
  };
});

export default CreateOrganisation;
