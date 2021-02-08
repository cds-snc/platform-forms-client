import React from "react";
import classnames from "classnames";
import { I18n } from "next-i18next";
import Head from "next/head";
import { Form } from "../../forms/Form/Form";
import { useRouter } from "next/router";
import { getProperty, getRenderedForm } from "../../../lib/formBuilder";
import { FormMetadataProperties } from "../../../lib/types";
import { withTranslation } from "../../../i18n";

interface DynamicFormProps {
  i18n: I18n;
  formMetadata: FormMetadataProperties;
  className?: string;
  children?: React.ReactNodeArray;
}

export const DynamicForm = (props: DynamicFormProps): React.ReactElement => {
  const { formMetadata, i18n } = props;
  const language = i18n.language as string;
  const classes = classnames("gc-form-wrapper", props.className);
  const currentForm = getRenderedForm(formMetadata, language);
  const formTitle = formMetadata[getProperty("title", language)] as string;

  return (
    <div className={classes}>
      <Head>
        <title>{formTitle}</title>
      </Head>
      <h1 className="gc-h1">{formTitle}</h1>
      <Form formMetadata={formMetadata} language={language}>
        {currentForm}
      </Form>
    </div>
  );
};

export default withTranslation()(DynamicForm);
