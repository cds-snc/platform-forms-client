import Organisations from "../../../components/containers/Admin/Organisations/Organisations";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "../../../lib/auth";
import { crudOrganisations } from "@lib/integration/crud";

export const getServerSideProps = requireAuthentication(async (context) => {
  {
    // getStaticProps is serverside, and therefore instead of doing a request,
    // we import the invoke Lambda function directly
    const lambdaResult = await crudOrganisations({ method: "GET" });

    const organisations =
      lambdaResult?.data?.records && lambdaResult.data.records.length > 0
        ? lambdaResult.data.records
        : [];

    if (context.locale) {
      return {
        props: {
          organisations: organisations,
          ...(await serverSideTranslations(context.locale, ["common", "organisations"])),
        }, // will be passed to the page component as props
      };
    }
    return { props: {} };
  }
});

export default Organisations;
