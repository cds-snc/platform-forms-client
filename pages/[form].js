import { getFormByID } from "../lib/dataLayer";
import DynamicForm from "../components/containers/DynamicForm/DynamicForm";

export async function getServerSideProps(context) {
  let form = null;
  const formId = context.params.form;

  if (formId === "preview-form" && context.query) {
    // If we're previewing a form, get the object from the query string
    const queryObj = context.query;
    const parsedForm =
      queryObj && queryObj.formObject ? JSON.parse(queryObj.formObject) : null;
    form = parsedForm && parsedForm.form ? parsedForm.form : null;
  } else {
    //Otherwise, get the form object via the dataLayer library
    form = await getFormByID(context.params.form);
  }

  if (!form) {
    return {
      redirect: {
        // We can redirect to a 'Form does not exist page' in the future
        destination: "/404",
        permanent: false,
      },
    };
  }

  return {
    props: { formMetadata: form }, // will be passed to the page component as props
  };
}

export default DynamicForm;
