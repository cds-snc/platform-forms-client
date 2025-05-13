"use client";
import React from "react";
import { useTranslation } from "@i18n/client";

import { ToastContainer } from "@formBuilder/components/shared/Toast";
import { GcdsH1 } from "@serverComponents/globals/GcdsH1";
import { Upload } from "./Upload";
import { Instructions } from "./Instructions";
import { StartAgain } from "./StartAgain";

export const ResumeForm = ({
  formId,
  titleEn,
  titleFr,
}: {
  formId: string;
  titleEn: string;
  titleFr: string;
}) => {
  const {
    i18n: { language },
  } = useTranslation(["form-builder", "common"]);

  const title = language === "en" ? titleEn : titleFr;

  return (
    <>
      <div className="mb-4 flex flex-col items-center justify-center">
        <GcdsH1>{title}</GcdsH1>
        <Upload formId={formId} />
        <Instructions />
        <StartAgain formId={formId} />
      </div>
      <ToastContainer limit={1} autoClose={false} containerId="resume" />
    </>
  );
};
