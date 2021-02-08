import { withTranslation } from "../i18n";
import { getFormByID } from "../lib/dataLayer";
import DynamicForm from "../components/containers/DynamicForm/DynamicForm";

export async function getServerSideProps(context) {
  const form = await getFormByID(context.params.form);
  if (!form) {
    return {
      redirect: {
        // We can redirect to a 'Form does not exist page' in the future
        destination: "/doesNotExist",
        permanent: false,
      },
    };
  }

  return {
    props: { formMetadata: form }, // will be passed to the page component as props
  };
}

export default withTranslation()(DynamicForm);
