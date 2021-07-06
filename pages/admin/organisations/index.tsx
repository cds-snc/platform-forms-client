import Organisations from "../../../components/containers/Admin/Organisations/Organisations";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "../../../lib/auth";
import { crudOrganisations } from "@lib/dataLayer";

export const getServerSideProps = requireAuthentication(async (context) => {
  {
    // getStaticProps is serverside, and therefore instead of doing a request,
    // we import the invoke Lambda function directly
    const lambdaResult = await crudOrganisations({ method: "GET" });
    console.log(lambdaResult);
    const organisations =
      lambdaResult && lambdaResult.data && lambdaResult.data.length > 0 ? lambdaResult.data : [];

    if (context.locale) {
      return {
        props: {
          organisations: [organisations],
          ...(await serverSideTranslations(context.locale, ["common", "admin-templates"])),
        }, // will be passed to the page component as props
      };
    }
    return { props: {} };
  }
});

export default Organisations;
