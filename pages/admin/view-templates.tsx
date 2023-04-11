import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getForms } from "@lib/integration/crud";
import { requireAuthentication } from "@lib/auth";

import React, { Fragment } from "react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormRecord } from "@lib/types";

interface DataViewProps {
  templatesJSON: Array<FormRecord>;
}

const DataView = (props: DataViewProps): React.ReactElement => {
  const { t } = useTranslation("admin-templates");

  const jsonElements = props.templatesJSON.map((template): React.ReactElement => {
    return <DataElement template={template} key={props.templatesJSON.indexOf(template)} />;
  });

  return (
    <>
      <Head>
        <title>Data View</title>
      </Head>

      <h1 className="gc-h1">{t("view.title")}</h1>
      <ul className="data_list">
        <Fragment>{jsonElements}</Fragment>
      </ul>
    </>
  );
};

const DataElement = (props: { template: FormRecord }): React.ReactElement => {
  const { t, i18n } = useTranslation("admin-templates");
  const { template } = props;
  const formID = template.formID;
  const router = useRouter();

  const redirectToSettings = (formID: number) => {
    router.push({
      pathname: `/${i18n.language}/id/${formID}/settings`,
    });
  };

  let title = "";
  if (template.formConfig) {
    if (i18n.language === "en")
      title = template.formConfig.internalTitleEn
        ? template.formConfig.internalTitleEn
        : template.formConfig.form.titleEn;
    else if (i18n.language === "fr")
      title = template.formConfig.internalTitleFr
        ? template.formConfig.internalTitleFr
        : template.formConfig.form.titleFr;
  }
  return (
    <li>
      <div className="pb-4 m-auto px-4">
        <div className="update-buttons mr-4">
          <button onClick={() => redirectToSettings(formID)} className="gc-button">
            {t("view.update")}
          </button>
        </div>
        <div className="inline-block break-words form-title">
          <p>
            {t("view.formID")} {formID}
          </p>
          <p>{title}</p>
        </div>
      </div>
    </li>
  );
};

export const getServerSideProps = requireAuthentication(async (context) => {
  {
    // getStaticProps is serverside, and therefore instead of doing a request,
    // we import the invoke Lambda function directly

    const templatesJSON = await getForms();

    return {
      props: {
        templatesJSON: templatesJSON.data.records,
        ...(context.locale &&
          (await serverSideTranslations(context.locale, ["common", "admin-templates"]))),
      }, // will be passed to the page component as props
    };

    return { props: {} };
  }
});

export default DataView;
