import React from "react";
import classnames from "classnames";
import Head from "next/head";
import { Form } from "../../forms/Form/Form";
import { useRouter } from "next/router";
import { getProperty, getRenderedForm } from "../../../lib/formBuilder";
import { FormMetadataProperties } from "../../../lib/types";

interface DynamicFormProps {
  i18n?: object;
  formMetadata: FormMetadataProperties;
  className?: string;
  children?: React.ReactNodeArray;
}

export const DynamicForm = (props: DynamicFormProps): React.ReactElement => {
  const { formMetadata, i18n } = props;
  const classes = classnames("gc-form-wrapper", props.className);
  const currentForm = getRenderedForm(formMetadata, i18n.language);
  const formTitle: string = formMetadata[getProperty("title", i18n.language)];
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{formTitle}</title>
      </Head>
      <h1 className="gc-h1">{formTitle}</h1>
      <Form formMetadata={formMetadata} i18n={i18n} router={router}>
        {currentForm}
      </Form>
    </>
  );
};

export default DynamicForm;
