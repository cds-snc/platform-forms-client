import React, { Fragment, useState } from "react";
//import classnames from "classnames";
import { useTranslation } from "next-i18next";
import { TFunction } from "next-i18next";
import Head from "next/head";

interface DataViewProps {
  templatesJSON: Array<JSON>;
}

export const DataView = (props: DataViewProps): React.ReactElement => {
  const { t } = useTranslation("admin-templates");

  const jsonElements = props.templatesJSON.map(
    (template): React.ReactElement => {
      return (
        <DataElement
          template={JSON.stringify(template)}
          key={props.templatesJSON.indexOf(template)}
          t={t}
        />
      );
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

const DataElement = (props: { template: string; t: TFunction }): React.ReactElement => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = props;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <li className={isExpanded ? "expanded" : ""}>
      <button className="expand" onClick={() => toggleExpanded()}>
        {isExpanded ? t("view.collapse") : t("view.expand")}
      </button>
      <div className="expandable pb-4 m-auto px-4">
        <span>{props.template}</span>
        <div className="update-buttons">
          <button className="gc-button">{t("view.update")}</button>
        </div>
      </div>
    </li>
  );
};

export default DataView;
