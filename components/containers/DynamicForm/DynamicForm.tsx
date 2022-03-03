import React from "react";
import classnames from "classnames";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { Form } from "../../forms/Form/Form";
import { TextPage } from "../../forms/TextPage/TextPage";
import { getProperty, getRenderedForm } from "../../../lib/formBuilder";
import { DynamicFormProps } from "../../../lib/types";
import { useRouter } from "next/router";
import { useFlag } from "../../../lib/hooks/useFlag";
import Script from "next/script";

/* The Dynamic form component is the outer stateful component which renders either a form step or a
    form text page based on the step
*/

export const DynamicForm = (props: DynamicFormProps): React.ReactElement => {
  const { formConfig, mockedFormFile, isReCaptchaEnableOnSite } = props;
  const { t, i18n } = useTranslation();
  const language = i18n.language as string;
  const classes = classnames("gc-form-wrapper");
  const currentForm = getRenderedForm(formConfig, language);
  const formTitle = formConfig[getProperty("title", language)] as string;
  const router = useRouter();
  const { step, htmlEmail } = router.query;
  const notifyPreviewFlag = useFlag("notifyPreview");
  const reChaptchaScriptURL = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY}`;

  // render text pages
  if (step == "confirmation") {
    return (
      <TextPage formConfig={formConfig} htmlEmail={htmlEmail as string | undefined}></TextPage>
    );
  }

  return (
    <div className={classes}>
      <Head>
        <title>{formTitle}</title>
      </Head>
      {isReCaptchaEnableOnSite ? (
        <Script src={reChaptchaScriptURL} strategy="beforeInteractive" />
      ) : (
        ""
      )}
      <h1 className="gc-h1">{formTitle}</h1>
      <Form
        formConfig={formConfig}
        language={language}
        router={router}
        t={t}
        notifyPreviewFlag={notifyPreviewFlag}
        mockedFormFile={mockedFormFile}
        isReCaptchaEnableOnSite={isReCaptchaEnableOnSite}
      >
        {currentForm}
      </Form>
    </div>
  );
};

export default DynamicForm;
