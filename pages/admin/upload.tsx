import JSONUpload from "../../components/forms/JsonUpload/JsonUpload";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "../../lib/auth";

export const getServerSideProps = requireAuthentication(async (context) => {
  if (context.locale) {
    return {
      props: {
        ...(await serverSideTranslations(context.locale, ["common", "admin-templates"])),
      },
    };
  }

  return { props: {} };
});

export default JSONUpload;
