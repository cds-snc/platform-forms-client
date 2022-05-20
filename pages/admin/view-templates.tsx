import DataView from "../../components/containers/Admin/Dashboard/DataView";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getForms } from "@lib/integration/crud";
import { requireAuthentication } from "@lib/auth";

export const getServerSideProps = requireAuthentication(async (context) => {
  {
    // getStaticProps is serverside, and therefore instead of doing a request,
    // we import the invoke Lambda function directly

    const templatesJSON = await getForms();

    if (context.locale) {
      return {
        props: {
          templatesJSON: templatesJSON.data.records,
          ...(await serverSideTranslations(context.locale, ["common", "admin-templates"])),
        }, // will be passed to the page component as props
      };
    }
    return { props: {} };
  }
});

export default DataView;
