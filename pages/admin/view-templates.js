//import getConfig from "next/config";
import DataView from "../../components/containers/Dashboard/DataView";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { invokeLambda } from "../api/templates";

export async function getStaticProps(context) {
  // Get data from the API
  const payload = {
    method: "GET",
  };
  const lambdaResult = JSON.parse(await invokeLambda(payload));
  console.log(lambdaResult);
  const templatesJSON = lambdaResult.data.records.length > 0 ? lambdaResult.data.records : [];

  return {
    props: {
      templatesJSON: templatesJSON,
      ...(await serverSideTranslations(context.locale, ["common", "welcome", "confirmation"])),
    }, // will be passed to the page component as props
  };
}

export default DataView;
