import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "../../../lib/auth";
import { invokeLambda } from "../../api/templates";
import FormSettings from "../../../components/containers/DynamicForm/Settings";

export const getServerSideProps = requireAuthentication(async (context) => {
  const formID = context && context.params && context.params.form ? context.params.form : undefined;

  // get form info from db
  const payload = {
    method: "GET",
    formID: formID,
  };
  const lambdaResult = JSON.parse((await invokeLambda(payload)) as string);

  if (context.locale && lambdaResult.data.records.length === 1) {
    return {
      props: {
        form: lambdaResult.data.records[0],
        ...(await serverSideTranslations(context.locale, ["common", "admin-templates"])),
      },
    };
  }
  // if no form returned, 404
  return {
    redirect: {
      // We can redirect to a 'Form does not exist page' in the future
      destination: "/404",
      permanent: false,
    },
  };
});

export default FormSettings;
