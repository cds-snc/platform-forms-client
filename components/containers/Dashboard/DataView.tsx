import React, { Fragment, useState } from "react";
//import classnames from "classnames";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormDBConfigProperties } from "../../../lib/types";

interface DataViewProps {
  templatesJSON: Array<FormDBConfigProperties>;
}

export const DataView = (props: DataViewProps): React.ReactElement => {
  const { t } = useTranslation("admin-templates");

  const jsonElements = props.templatesJSON.map(
    (template): React.ReactElement => {
      return <DataElement template={template} key={props.templatesJSON.indexOf(template)} />;
    }
  );

  return (
    <>
      <Head>
        <title>Data View</title>
      </Head>

      <h1 className="gc-h1">{t("view.title")}</h1>
      <ul className="json_templates">
        <Fragment>{jsonElements}</Fragment>
      </ul>
    </>
  );
};

const DataElement = (props: { template: FormDBConfigProperties }): React.ReactElement => {
  const { t, i18n } = useTranslation("admin-templates");
  const [isExpanded, setIsExpanded] = useState(false);
  const { template } = props;
  const formID = template.formID;
  const router = useRouter();

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const redirectToSettings = (formID: number) => {
    router.push({
      pathname: `/${i18n.language}/id/${formID}/settings`,
    });
  };

  return (
    <li className={isExpanded ? "expanded" : ""}>
      <button className="expand" onClick={() => toggleExpanded()}>
        {isExpanded ? t("view.collapse") : t("view.expand")}
      </button>
      <div className="expandable pb-4 m-auto px-4">
        <span>{JSON.stringify(template)}</span>
        <div className="update-buttons">
          <button onClick={() => redirectToSettings(formID)} className="gc-button">
            {t("view.update")}
          </button>
        </div>
      </div>
    </li>
  );
};

export default DataView;
