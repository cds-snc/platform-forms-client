import { getFormByID } from "../../../lib/dataLayer";
import getConfig from "next/config";
import DynamicForm from "../../../components/containers/DynamicForm/DynamicForm";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getServerSideProps(context) {
  let form = null;
  const formId = context.params.form;
  const {
    publicRuntimeConfig: { isProduction: isProduction },
  } = getConfig();

  if (formId === "preview-form" && context.query) {
    // If we're previewing a form, get the object from the query string
    const queryObj = context.query;
    const parsedForm =
      queryObj && queryObj.formObject
        ? JSON.parse(queryObj.formObject)
        : null;
    form = parsedForm && parsedForm.form ? parsedForm.form : null;
  } else {
    //Otherwise, get the form object via the dataLayer library
    form = await getFormByID(context.params.form);
  }
  // Only retrieve publish ready forms if isProduction

  if (!form || (!form.publishingStatus && isProduction)) {
    return {
      redirect: {
        // We can redirect to a 'Form does not exist page' in the future
        destination: "/404",
        permanent: false,
      },
    };
  }

  return {
    props: {
      formMetadata: form,
      ...(await serverSideTranslations(context.locale, [
        "common",
        "welcome",
        "confirmation",
      ])),
    }, // will be passed to the page component as props
  };
}

export default DynamicForm;
