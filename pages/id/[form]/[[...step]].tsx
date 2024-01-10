import { getPublicTemplateByID } from "@lib/templates";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { checkOne } from "@lib/cache/flags";
import React, { ReactElement } from "react";
import classnames from "classnames";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { Form, TextPage, ClosedPage, NextButton } from "@components/forms";
import { getProperty, getRenderedForm } from "@lib/formBuilder";
import { useRouter } from "next/router";
import { PublicFormRecord } from "@lib/types";
import { GetServerSideProps } from "next";
import { NextPageWithLayout } from "@pages/_app";
import { dateHasPast } from "@lib/utils";
import { GCFormsProvider } from "@lib/hooks/useGCFormContext";

import FormDisplayLayout from "@components/globals/layouts/FormDisplayLayout";

/* The Dynamic form component is the outer stateful component which renders either a form step or a
    form text page based on the step
*/

interface RenderFormProps {
  formRecord: PublicFormRecord;
}

const RenderForm: NextPageWithLayout<RenderFormProps> = ({
  formRecord,
}: RenderFormProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const language = i18n.language as "en" | "fr";
  const classes = classnames("gc-form-wrapper");
  const currentForm = getRenderedForm(formRecord, language, t);
  const formTitle = formRecord.form[getProperty("title", language)] as string;
  const router = useRouter();
  const { step } = router.query;

  let isPastClosingDate = false;

  if (formRecord.closingDate) {
    isPastClosingDate = dateHasPast(Date.parse(formRecord.closingDate));
  }

  if (isPastClosingDate) {
    return <ClosedPage language={language} formRecord={formRecord} />;
  }

  // render text pages
  if (step == "confirmation") {
    return <TextPage formRecord={formRecord} />;
  }

  return (
    <>
      <Head>
        <title>{formTitle}</title>
      </Head>
      <div className={classes}>
        <h1>{formTitle}</h1>
        <GCFormsProvider formRecord={formRecord}>
          <Form
            formRecord={formRecord}
            language={language}
            router={router}
            t={t}
            renderSubmit={({ validateForm, fallBack }) => {
              return <NextButton validateForm={validateForm} fallBack={fallBack} />;
            }}
          >
            {currentForm}
          </Form>
        </GCFormsProvider>
      </div>
    </>
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

RenderForm.getLayout = function getLayout(page: ReactElement) {
  const isEmbeddable = page.props.formRecord && page.props.isEmbeddable;
  return (
    <FormDisplayLayout formRecord={page.props.formRecord} embedded={isEmbeddable}>
      {page}
    </FormDisplayLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const unpublishedForms = await checkOne("unpublishedForms");
  let publicForm: PublicFormRecord | null = null;
  const formID = context.params?.form;
  const isEmbeddable = context.query?.embed == "true" || null;

  if (formID === "preview-form" && context.query?.formObject) {
    // If we're previewing a form, get the object from the query string

    // If more then one formObject param is passed in short circuit back to 404
    if (Array.isArray(context.query?.formObject)) return redirect(context.locale);
    const queryObj = context.query.formObject;
    const parsedForm = JSON.parse(queryObj);
    publicForm = parsedForm.form ?? null;
  } else {
    //Otherwise, get the form object via the dataLayer library
    // Needed for typechecking of a ParsedURLQuery type which can be a string or string[]
    if (!formID || Array.isArray(formID)) return redirect(context.locale);

    publicForm = await getPublicTemplateByID(formID);
  }

  // Redirect if form doesn't exist and
  // Only retrieve publish ready forms if isProduction
  if (!publicForm || (!publicForm?.isPublished && !unpublishedForms)) {
    return redirect(context.locale);
  }

  // undefined will throw a serialization error in which case delete the key as it's uneeded
  if (typeof publicForm.closingDate === "undefined") {
    delete publicForm.closingDate;
  }

  return {
    props: {
      formRecord: publicForm,
      isEmbeddable: isEmbeddable,
      ...(context.locale &&
        (await serverSideTranslations(context.locale, [
          "common",
          "welcome",
          "confirmation",
          "form-closed",
        ]))),
    }, // will be passed to the page component as props
  };
};

export default RenderForm;
