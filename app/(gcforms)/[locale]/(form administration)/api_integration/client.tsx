"use client";

import { useState, useEffect } from "react";

import { NoFileSystemAccess } from "./components/NoFileSystemAccess";
import { LoadKey } from "./components/LoadKey";

import { useGetClient } from "./hooks/useGetClient";
import { Submissions } from "./components/Submissions";

export const Client = () => {
  const { isCompatible, userKey } = useGetClient();

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
    return <LoadKey />;
  }

  return <Submissions />;
};
