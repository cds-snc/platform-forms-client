import React from "react";
import classnames from "classnames";
import { I18n, TFunction } from "next-i18next";
import Head from "next/head";
import { Form } from "../../forms/Form/Form";
import { getProperty, getRenderedForm } from "../../../lib/formBuilder";
import { FormMetadataProperties } from "../../../lib/types";
import { withTranslation } from "../../../i18n";
import { useRouter } from "next/router";

interface DynamicFormProps {
  i18n: I18n;
  t: TFunction;
  formMetadata: FormMetadataProperties;
  className?: string;
}

export const DynamicForm = (props: DynamicFormProps): React.ReactElement => {
  const { formMetadata, i18n, t } = props;
  const language = i18n.language as string;
  const router = useRouter();
  const classes = classnames("gc-form-wrapper");
  const innerFormClasses = classnames({
    "preview-form": router.query && router.query.form === "preview-form",
  });
  const currentForm = getRenderedForm(formMetadata, language);
  const formTitle = formMetadata[getProperty("title", language)] as string;

  return (
    <div className={classes}>
      <Head>
        <title>{formTitle}</title>
      </Head>
      <h1 className="gc-h1">{formTitle}</h1>
      <Form
        formMetadata={formMetadata}
        language={language}
        router={router}
        t={t}
        className={innerFormClasses}
      >
        {currentForm}
      </Form>
    </div>
  );
};

export default withTranslation()(DynamicForm);
