import DataView from "../../components/containers/Admin/Dashboard/DataView";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import executeQuery from "@lib/integration/queryManager";
import dbConnector from "@lib/integration/dbConnector";
import { logMessage } from "@lib/logger";
import { CrudTemplateResponse } from "@lib/types";

export const getServerSideProps = requireAuthentication(async (context) => {
  {
    // getStaticProps is serverside, and therefore instead of doing a request,
    // we import the invoke Lambda function directly

    const templatesJSON = await getTemplates();

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

/*@description
 * Get all templates
 * @returns An array of all Templates
 */
const getTemplates = async (): Promise<CrudTemplateResponse[]> => {
  try {
    const result = await executeQuery(
      await dbConnector(),
      'SELECT id as "formID", json_config as "formConfig", organization FROM Templates'
    );
    return result.rows as CrudTemplateResponse[];
  } catch (e) {
    logMessage.error(e as Error);
    return [];
  }
};

export default DataView;
