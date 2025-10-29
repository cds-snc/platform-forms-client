"use client";

import { NoFileSystemAccess } from "./components/NoFileSystemAccess";
import { useGetClient } from "./hooks/useGetClient";

// Step Components
import { Start } from "./components/pages/Start";
import { SelectApiKey } from "./components/pages/SelectApiKey";
import { SelectLocation } from "./components/pages/SelectLocation";
import { SelectFormat } from "./components/pages/SelectFormat";
import { ContentWrapper } from "./components/ContentWrapper";
import { GenerateFormatFromJson } from "./components/pages/GenerateFormatFromJson";
import { JSX } from "react";
import {
  PageKey,
  useStepFlow,
  ApiResponseDownloadProvider,
} from "./contexts/ApiResponseDownloaderContext";
import { ProcessingDownloads } from "./components/pages/ProcessingDownloads";
import { CheckForNewResponses } from "./components/pages/CheckForNewResponses";

const ClientContent = () => {
  const { currentPage } = useStepFlow();

  const pages: Record<PageKey, JSX.Element> = {
    start: <Start />,
    selectApiKey: <SelectApiKey />,
    selectLocation: <SelectLocation />,
    selectFormat: <SelectFormat />,
    processingDownloads: <ProcessingDownloads />,
    generateFormatFromJson: <GenerateFormatFromJson />,
    checkForNewResponses: <CheckForNewResponses />,
  };

  return <ContentWrapper>{pages[currentPage]}</ContentWrapper>;
};

export const Client = () => {
  const { isCompatible } = useGetClient();

  if (!isCompatible) {
    return <NoFileSystemAccess />;
  }

  return (
    <ApiResponseDownloadProvider>
      <ClientContent />
    </ApiResponseDownloadProvider>
  );
};
