//import getConfig from "next/config";
import DataView from "../../components/containers/Admin/Dashboard/DataView";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { crudTemplates } from "../../lib/integration/crud";
import { requireAuthentication } from "../../lib/auth";

export const getServerSideProps = requireAuthentication(async (context) => {
  {
    // getStaticProps is serverside, and therefore instead of doing a request,
    // we import the invoke Lambda function directly

    const templatesJSON: unknown[] = [];

    const getTemplatesFromLambda = async (limit = 13, offset = 0) => {
      const lambdaResult = await crudTemplates({ method: "GET", limit: limit, offset: offset });

      if (!lambdaResult || !lambdaResult.data || !lambdaResult.data.records) {
        return;
      }

      Array.prototype.push.apply(templatesJSON, lambdaResult.data.records);

      if (!(lambdaResult.data.records.length < limit)) {
        await getTemplatesFromLambda(limit, offset + limit);
      }
    };

    await getTemplatesFromLambda();

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
