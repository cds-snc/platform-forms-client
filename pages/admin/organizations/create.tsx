import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { requireAuthentication } from "../../../lib/auth";
import { CreateOrganization } from "../../../components/containers/Admin/Organizations/CreateOrganization";

export const getServerSideProps: GetServerSideProps = requireAuthentication(async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context && context.locale ? context.locale : "", [
        "common",
        "organizations",
      ])),
    }, // will be passed to the page component as props
  };
});

export default CreateOrganization;
