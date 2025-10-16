"use client";

import { useState, useEffect } from "react";

import { NoFileSystemAccess } from "./components/NoFileSystemAccess";
import { LoadKey } from "./components/LoadKey";

import { useGetClient } from "./hooks/useGetClient";
import { Submissions } from "./components/Submissions";

import { Csv } from "./components/Csv";

export type ClientProps = { csv?: string | string[] | undefined };

export const Client = ({ csv }: ClientProps = {}) => {
  const { isCompatible, userKey, handleLoadApiKey, apiClient } = useGetClient();
  const shouldGenerateCsv = typeof csv !== "undefined";

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
    return <LoadKey onLoadKey={handleLoadApiKey} />;
  }

  if (shouldGenerateCsv && apiClient) {
    return <Csv apiClient={apiClient} />;
  }

  return <Submissions apiClient={apiClient} userKey={userKey} />;
};
