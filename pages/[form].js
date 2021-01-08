import React from "react";
import PropTypes from "prop-types";
import { withTranslation } from "../i18n";
import Form from "../components/forms/Forms";

import { getFormByID } from "../lib/dataLayer";

const DynamicForm = ({ formObject }) => <Form formModel={formObject} />;

DynamicForm.defaultProps = {
  i18nNamespaces: ["common"],
};

DynamicForm.propTypes = {
  t: PropTypes.func.isRequired,
  formObject: PropTypes.object.isRequired,
};

export default withTranslation()(DynamicForm);

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
    props: { formObject: form }, // will be passed to the page component as props
  };
}
