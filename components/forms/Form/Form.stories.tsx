import React from "react";
import { Form } from "./Form";
import { getFormByID } from "../../../lib/dataLayer";

export default {
  title: "Forms/Form",
  component: Form,
  parameters: {
    info: `Form component`,
  },
};

export const defaultForm = (): React.ReactElement => {
  const formObject = getFormByID("1");

  return <Form formMetadata={formObject} i18n={{ language: "en" }}></Form>;
};

defaultForm.parameters = {
  docs: {
    source: {
      code: "",
    },
  },
};
