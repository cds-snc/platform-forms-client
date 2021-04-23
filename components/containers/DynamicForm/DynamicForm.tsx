import React from "react";
import classnames from "classnames";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { Form } from "../../forms/Form/Form";
import { TextPage } from "../../forms/TextPage/TextPage";
import { getProperty, getRenderedForm } from "../../../lib/formBuilder";
import { FormMetadataProperties } from "../../../lib/types";
import { useRouter } from "next/router";

interface DynamicFormProps {
  formMetadata: FormMetadataProperties;
}

/* The Dynamic form component is the outer stateful component which renders either a form step or a
    form text page based on the step
*/

export const DynamicForm = (props: DynamicFormProps): React.ReactElement => {
  const { formMetadata } = props;
  const { t, i18n } = useTranslation();
  const language = i18n.language as string;
  const classes = classnames("gc-form-wrapper");
  const currentForm = getRenderedForm(formMetadata, language);
  const formTitle = formMetadata[getProperty("title", language)] as string;
  const router = useRouter();
  const { step, urlQuery, htmlEmail } = router.query;

  // render text pages
  if (step == "confirmation") {
    return (
      <TextPage
        formMetadata={formMetadata}
        step={step}
        urlQuery={urlQuery as string | undefined}
        htmlEmail={htmlEmail as string | undefined}
      ></TextPage>
    );
  }

  return (
    <div className={classes}>
      <Head>
        <title>{formTitle}</title>
      </Head>
      <h1 className="gc-h1">{formTitle}</h1>
      <Form formMetadata={formMetadata} language={language} router={router} t={t}>
        {currentForm}
      </Form>
    </div>
  );
};

export default DynamicForm;
