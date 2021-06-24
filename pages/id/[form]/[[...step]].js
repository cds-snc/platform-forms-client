import { getFormByID } from "../../../lib/dataLayer";
import DynamicForm from "../../../components/containers/DynamicForm/DynamicForm";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { checkOne } from "../../../lib/flags";

export async function getServerSideProps(context) {
  const unpublishedForms = await checkOne("unpublishedForms");
  let form = null;
  const formId = context.params.form;
  const isEmbeddable = (context.query.embed && context.query.embed == "true") || null;

  if (formId === "preview-form" && context.query) {
    // If we're previewing a form, get the object from the query string
    const queryObj = context.query;
    const parsedForm = queryObj && queryObj.formObject ? JSON.parse(queryObj.formObject) : null;
    form = parsedForm && parsedForm.form ? parsedForm.form : null;
  } else {
    //Otherwise, get the form object via the dataLayer library
    form = await getFormByID(context.params.form);
  }
  // Only retrieve publish ready forms if isProduction

  if (!form || (!form.publishingStatus && !unpublishedForms)) {
    return {
      redirect: {
        // We can redirect to a 'Form does not exist page' in the future
        destination: `/${context.locale}/404`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      formConfig: form,
      isEmbeddable: isEmbeddable,
      ...(await serverSideTranslations(context.locale, ["common", "welcome", "confirmation"])),
    }, // will be passed to the page component as props
  };
}

export default DynamicForm;
