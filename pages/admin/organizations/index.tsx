import Organizations from "../../../components/containers/Admin/Organizations/Organizations";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "../../../lib/auth";
import { crudOrganizations } from "@lib/integration/crud";

export const getServerSideProps = requireAuthentication(async (context) => {
  {
    // getStaticProps is serverside, and therefore instead of doing a request,
    // we import the invoke Lambda function directly
    const lambdaResult = await crudOrganizations({ method: "GET" });

    const organizations =
      lambdaResult?.data?.records && lambdaResult.data.records.length > 0
        ? lambdaResult.data.records
        : [];

    if (context.locale) {
      return {
        props: {
          organizations: organizations,
          ...(await serverSideTranslations(context.locale, ["common", "organizations"])),
        }, // will be passed to the page component as props
      };
    }
    return { props: {} };
  }
});

export default Organizations;
