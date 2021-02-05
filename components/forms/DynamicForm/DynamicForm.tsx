import React from "react";
import classnames from "classnames";
import Head from "next/head";
import Form from "../Form/Form";
import {
  getProperty,
  getRenderedForm,
  FormElement,
} from "../../../lib/formBuilder";

interface DynamicFormProps {
  i18n: object;
  formObject: string;
  className?: string;
}

export const DynamicForm = (props: DynamicFormProps): React.ReactElement => {
  const { formObject, i18n } = props;
  const classes = classnames("gc-form-wrapper", props.className);
  const currentForm = getRenderedForm(formObject, i18n.language);

  return (
    <>
      <Head>
        <title>{formObject[getProperty("title", i18n.language)]}</title>
      </Head>
      <h1 className="gc-h1">
        {formObject[getProperty("title", i18n.language)]}
      </h1>
      <Form formObject={formObject}>{currentForm}</Form>
    </>
  );
};

export default DynamicForm;
