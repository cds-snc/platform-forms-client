import React from "react";
//import classnames from "classnames";
//import { useTranslation } from "next-i18next";
import Head from "next/head";

interface DataViewProps {
  templatesJSON: Array<JSON>;
}

export const DataView = (props: DataViewProps): React.ReactElement => {
  const TemplatesList = (): React.ReactElement => {
    return props.templatesJSON.map(
      (template): React.ReactElement => {
        return <li key={props.templatesJSON.indexOf(template)}>{JSON.stringify(template)}</li>;
      }
    );
  };

  return (
    <>
      <Head>
        <title>Data View</title>
      </Head>

      <h1 className="gc-h1">Data View</h1>
      <TemplatesList />
    </>
  );
};

export default DataView;
