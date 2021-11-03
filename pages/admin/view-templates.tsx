//import getConfig from "next/config";
import DataView from "../../components/containers/Admin/Dashboard/DataView";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { crudTemplates } from "../../lib/integration/crud";
import { requireAuthentication } from "../../lib/auth";

export const getServerSideProps = requireAuthentication(async (context) => {
  {
    // getStaticProps is serverside, and therefore instead of doing a request,
    // we import the invoke Lambda function directly

    const lambdaResult = await crudTemplates({ method: "GET" });
    const templatesJSON =
      lambdaResult &&
      lambdaResult.data &&
      lambdaResult.data.records &&
      lambdaResult.data.records.length > 0
        ? lambdaResult.data.records
        : [];

    if (context.locale) {
      return {
        props: {
          templatesJSON: templatesJSON,
          ...(await serverSideTranslations(context.locale, ["common", "admin-templates"])),
        }, // will be passed to the page component as props
      };
    }
    return { props: {} };
  }
});

export default DataView;
