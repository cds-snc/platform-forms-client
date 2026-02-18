"use client";
import React from "react";
import { TypeOmit, FormRecord } from "@lib/types";
import { ClosedPage, TextPage } from "@clientComponents/forms";
import { FormWrapper } from "./clientSide";
import { FormDelayProvider } from "@lib/hooks/useFormDelayContext";
import { ResumeForm } from "@clientComponents/forms/ResumeForm/ResumeForm";
import { ClosingNotice } from "@clientComponents/forms/ClosingNotice/ClosingNotice";
import { GcdsH1 } from "@serverComponents/globals/GcdsH1";
import { cn } from "@lib/utils";

export interface PageContentProps {
  formRecord: TypeOmit<FormRecord, "name" | "deliveryOption">;
  language: "en" | "fr";
  formTitle: string;
  isPastClosingDate: boolean;
  step: string;
  formId: string;
  saveAndResume: boolean;
  isAllowGrouping?: boolean;
}

export const PageContent = ({
  formRecord,
  language,
  formTitle,
  isPastClosingDate,
  step,
  formId,
  saveAndResume,
  isAllowGrouping,
}: PageContentProps) => {
  const classes = cn("gc-form-wrapper");

  // Closed page
  if (isPastClosingDate) {
    return <ClosedPage language={language} formRecord={formRecord} />;
  }

  // Resume form page
  if (saveAndResume && step === "resume") {
    return (
      <ResumeForm
        titleEn={formRecord.form.titleEn}
        titleFr={formRecord.form.titleFr}
        formId={formId}
      />
    );
  }

  // Confirmation page
  if (step === "confirmation") {
    return (
      <div className={classes}>
        <TextPage formId={formId} formRecord={formRecord} />
      </div>
    );
  }

  // Form page (default)
  return (
    <div className={classes}>
      <FormDelayProvider>
        <FormWrapper
          header={
            <>
              <ClosingNotice language={language} closingDate={formRecord.closingDate} />
              <GcdsH1 tabIndex={-1}>{formTitle}</GcdsH1>
            </>
          }
          formRecord={formRecord}
          allowGrouping={isAllowGrouping}
        />
      </FormDelayProvider>
    </div>
  );
};
