import React from "react";
import { HTMLDownloadPage } from "./HTMLDownloadPage";
import { ProtectedWarning } from "./ProtectedWarning";
import Fip from "@components/globals/Fip";

interface HTMLDownloadFileProps {
  formResponse: any; //TODO
  confirmReceiptCode: string;
}

export const HTMLDownloadFile = (props: HTMLDownloadFileProps) => {
  const { formResponse, confirmReceiptCode } = props;
  const {
    // id,
    responseNumber,
    submissionDate,
    questionsAnswersEn,
    questionsAnswersFr,
    titleEn,
    titleFr,
  } = formResponse;

  return (
    <>
      <ProtectedWarning lang="en" />
      {/* TODO?: FIP may be  being using beyond intention. Re-create if so and revert _header.scss */}
      <Fip />
      <div className="mt-14" />
      <HTMLDownloadPage
        confirmReceiptCode={confirmReceiptCode}
        lang={"en"}
        // id={id}
        responseNumber={responseNumber}
        submissionDate={submissionDate}
        title={titleEn}
        questionsAnswers={questionsAnswersEn}
      />

      <div className="mt-20" />

      <ProtectedWarning lang="fr" />
      <Fip />
      <div className="mt-14" />
      <HTMLDownloadPage
        confirmReceiptCode={confirmReceiptCode}
        lang={"fr"}
        // id={id}
        responseNumber={responseNumber}
        submissionDate={submissionDate}
        title={titleFr}
        questionsAnswers={questionsAnswersFr}
      />
    </>
  );
};
