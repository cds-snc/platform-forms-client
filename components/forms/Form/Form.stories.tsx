import React from "react";
import { Form } from "./Form";

export default {
  title: "Forms/Form",
  component: Form,
  parameters: {
    info: `Form component`,
  },
};

export const defaultForm = (): React.ReactElement => {

  return <Form t={(key: string) => key}>Test</Form>;
};

defaultForm.parameters = {
  docs: {
    source: {
      code: "",
    },
  },
};
