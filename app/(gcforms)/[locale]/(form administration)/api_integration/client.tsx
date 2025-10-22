"use client";

import { useState, useEffect } from "react";

import { NoFileSystemAccess } from "./components/NoFileSystemAccess";
import { LoadKey } from "./components/LoadKey";

import { useGetClient } from "./hooks/useGetClient";
import { Submissions } from "./components/Submissions";

import { Csv } from "./components/Csv";
import { Html } from "./components/Html";

export const Client = () => {
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
        <LoadKey onLoadKey={handleLoadApiKey} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2>Download and process to CSV</h2>
        <Submissions apiClient={apiClient} userKey={userKey} />
      </div>
      <div>
        <h2>Process files to CSV</h2>
        <Csv apiClient={apiClient} />
      </div>
      <div>
        <h2>Process files to HTML</h2>
        <Html apiClient={apiClient} />
      </div>
    </div>
  );
};
