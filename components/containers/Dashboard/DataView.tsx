import React, { Fragment, useState } from "react";
//import classnames from "classnames";
//import { useTranslation } from "next-i18next";
import Head from "next/head";

interface DataViewProps {
  templatesJSON: Array<JSON>;
}

export const DataView = (props: DataViewProps): React.ReactElement => {
  const jsonElements = props.templatesJSON.map(
    (template): React.ReactElement => {
      return (
        <DataElement
          template={JSON.stringify(template)}
          key={props.templatesJSON.indexOf(template)}
        />
      );
    }
  );

  return (
    <>
      <Head>
        <title>Data View</title>
      </Head>

      <h1 className="gc-h1">Data View</h1>
      <ul className="json_templates">
        <Fragment>{jsonElements}</Fragment>
      </ul>
    </>
  );
};

const DataElement = (props: { template: string }): React.ReactElement => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <li className={isExpanded ? "expanded" : ""}>
      <button className="expand" onClick={() => toggleExpanded()}>
        {isExpanded ? "Collapse" : "Expand"}
      </button>
      <span>{props.template}</span>
    </li>
  );
};

export default DataView;
