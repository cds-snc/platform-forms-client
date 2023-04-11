import { getFormByID } from "@lib/integration/crud";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { checkOne } from "@lib/flags";
import React from "react";
import classnames from "classnames";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { Form, TextPage } from "@components/forms";
import { getProperty, getRenderedForm } from "@lib/formBuilder";
import { useRouter } from "next/router";
import { useFlag } from "@lib/hooks/useFlag";
import { PublicFormRecord } from "@lib/types";
import { GetServerSideProps } from "next";

/* The Dynamic form component is the outer stateful component which renders either a form step or a
    form text page based on the step
*/

const RenderForm = ({ formRecord }: { formRecord: PublicFormRecord }): React.ReactElement => {
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

// Redirects to 404 page
function redirect(locale: string | undefined) {
  return {
    redirect: {
      // We can redirect to a 'Form does not exist page' in the future
      destination: `/${locale}/404`,
      permanent: false,
    },
  };
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const unpublishedForms = await checkOne("unpublishedForms");
  let form = null;
  const formId = context.params?.form;
  const isEmbeddable = context.query?.embed == "true" || null;

  if (formId === "preview-form" && context.query?.formObject) {
    // If we're previewing a form, get the object from the query string

    // If more then one formObject param is passed in short circuit back to 404
    if (Array.isArray(context.query?.formObject)) return redirect(context.locale);
    const queryObj = context.query.formObject;
    const parsedForm = JSON.parse(queryObj);
    form = parsedForm.form ?? null;
  } else {
    //Otherwise, get the form object via the dataLayer library
    // Needed for typechecking of a ParsedURLQuery type which can be a string or string[]
    if (
      !context.params?.form ||
      Array.isArray(context.params.form) ||
      isNaN(parseInt(context.params.form))
    )
      return redirect(context.locale);

    form = await getFormByID(parseInt(context.params.form));
  }

  // Redirect if form doesn't exist and
  // Only retrieve publish ready forms if isProduction
  // Short circuit only if Cypress testing
  if (!form || (!form?.formConfig?.publishingStatus && !unpublishedForms)) {
    return redirect(context.locale);
  }
  return {
    props: {
      formRecord: form,
      isEmbeddable: isEmbeddable,
      ...(context.locale &&
        (await serverSideTranslations(context.locale, ["common", "welcome", "confirmation"]))),
    }, // will be passed to the page component as props
  };
};

export default RenderForm;
