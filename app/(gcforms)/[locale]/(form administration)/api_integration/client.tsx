"use client";

import { useState, useEffect } from "react";

import { NoFileSystemAccess } from "./components/NoFileSystemAccess";
import { LoadKey } from "./components/LoadKey";

import { useGetClient } from "./hooks/useGetClient";
import { Submissions } from "./components/Submissions";

import { Csv } from "./components/Csv";
import { Html } from "./components/Html";

export type ClientProps = { format?: string | string[] | undefined };

export const Client = ({ format }: ClientProps = {}) => {
  const { isCompatible, userKey, handleLoadApiKey, apiClient } = useGetClient();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-initialize-state
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (!isCompatible) {
    return <NoFileSystemAccess />;
  }

  if (!userKey) {
    return (
      <>
        {format === "csv" && <h2>Generate CSV from files</h2>}
        {format === "html" && <h2>Generate HTML from files</h2>}
        {!format && <h2>Download and process to CSV</h2>}
        <LoadKey onLoadKey={handleLoadApiKey} />
      </>
    );
  }

  if (format && format === "csv" && apiClient) {
    return <Csv apiClient={apiClient} />;
  }

  if (format && format === "html" && apiClient) {
    return <Html apiClient={apiClient} />;
  }

  return <Submissions apiClient={apiClient} userKey={userKey} />;
};
