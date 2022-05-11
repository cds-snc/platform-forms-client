import React from "react";
import classnames from "classnames";
import { TFunction, useTranslation } from "next-i18next";
import Head from "next/head";
import { Form, TextPage } from "@components/forms";
import { getProperty, getRenderedForm } from "@lib/formBuilder";
import { NextRouter, useRouter } from "next/router";
import { useFlag } from "@lib/hooks/useFlag";
import { PublicFormRecord } from "@lib/types";
import SecurityAttributeBadge from "@components/globals/SecurityBadge";

/* The Dynamic form component is the outer stateful component which renders either a form step or a
    form text page based on the step
*/

export interface DynamicFormProps {
  formRecord: PublicFormRecord;
  language: string;
  router: NextRouter;
  notifyPreviewFlag: boolean;
  isReCaptchaEnableOnSite?: boolean;
  children?: (JSX.Element | undefined)[] | null;
  t: TFunction;
}

export const DynamicForm = (props: DynamicFormProps): React.ReactElement => {
  const { formRecord } = props;
  const { t, i18n } = useTranslation();
  const language = i18n.language as string;
  const classes = classnames("gc-form-wrapper");
  const currentForm = getRenderedForm(formRecord, language, t);
  const formTitle = formRecord.formConfig.form[getProperty("title", language)] as string;
  const router = useRouter();
  const { step, htmlEmail } = router.query;
  const notifyPreviewFlag = useFlag("notifyPreview");

  // render text pages
  if (step == "confirmation") {
    return <TextPage formRecord={formRecord} htmlEmail={htmlEmail as string | undefined} />;
  }

  return (
    <div className={classes}>
      <Head>
        <title>{formTitle}</title>
      </Head>
      {formRecord.formConfig.securityAttribute && (
        <SecurityAttributeBadge securityLevel={formRecord.formConfig.securityAttribute} />
      )}
      <h1 className="gc-h1">{formTitle}</h1>
      <Form
        formRecord={formRecord}
        language={language}
        router={router}
        t={t}
        notifyPreviewFlag={notifyPreviewFlag}
      >
        {currentForm}
      </Form>
    </div>
  );
};

export default DynamicForm;
