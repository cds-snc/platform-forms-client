//import getConfig from "next/config";
import DataView from "../../components/containers/Dashboard/DataView";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { invokeLambda } from "../api/templates";
import { requireAuthentication } from "../../lib/auth";

export const getServerSideProps = requireAuthentication(async (context) => {
  {
    // getStaticProps is serverside, and therefore instead of doing a request,
    // we import the invoke Lambda function directly
    const payload = {
      method: "GET",
    };
    const lambdaResult = JSON.parse((await invokeLambda(payload)) as string);
    const templatesJSON =
      lambdaResult.data && lambdaResult.data.records && lambdaResult.data.records.length > 0
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
