import React from "react";
import classnames from "classnames";
import Form from "../Form/Form";

interface DynamicFormProps {
  t: React.ReactNode;
  formObject: string;
  className?: string;
}

export const DynamicForm = (props: DynamicFormProps): React.ReactElement => {
  const { formObject, className, t } = props;
  console.log("DYNAMIC FORM IS CALLED", props);
  const classes = classnames("gc-form-wrapper", className);
  const formToRender = null;

  return <Form formModel={formObject}/>;
};

export default DynamicForm;