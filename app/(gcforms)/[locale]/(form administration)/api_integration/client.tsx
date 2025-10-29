"use client";

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
import { Confirmation } from "./components/pages/Confirmation";

const ClientContent = () => {
  const { currentPage } = useStepFlow();

  const pages: Record<PageKey, JSX.Element> = {
    start: <Start />,
    selectApiKey: <SelectApiKey />,
    selectLocation: <SelectLocation />,
    selectFormat: <SelectFormat />,
    processingDownloads: <ProcessingDownloads />,
    generateFormatFromJson: <GenerateFormatFromJson />,
    confirmation: <Confirmation />,
  };

  return <ContentWrapper>{pages[currentPage]}</ContentWrapper>;
};

export const Client = () => {
  return (
    <ApiResponseDownloadProvider>
      <ClientContent />
    </ApiResponseDownloadProvider>
  );
};
