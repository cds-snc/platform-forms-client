import { Dialog, TextArea, useDialogRef } from "@clientComponents/form-builder/app/shared";
import { Alert, Button } from "@clientComponents/globals";
import {
  MessageType,
  ValidationMessage,
} from "@clientComponents/globals/ValidationMessage/ValidationMessage";
import { useTranslation } from "@i18n/client";
import { randomId } from "@lib/client/clientHelpers";
import { logMessage } from "@lib/logger";
import { isResponseId } from "@lib/validation";
import { WarningIcon } from "@serverComponents/icons";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { DialogStates } from "./DialogStates";
import { LineItemEntries } from "./line-item-entries";

export const ReportDialog = ({
  apiUrl,
  inputRegex = isResponseId,
  maxEntries = 20,
}: {
  apiUrl: string;
  inputRegex?: (field: string) => boolean;
  maxEntries?: number;
}) => {
  const [isShowReportProblemsDialog, setIsShowReportProblemsDialog] = useState(false);
  const { t, i18n } = useTranslation(["form-builder-responses", "common"]);
  const router = useRouter();
  const path = usePathname();
  const [entries, setEntries] = useState<string[]>([]);
  const descriptionRef = useRef("");
  const [status, setStatus] = useState<DialogStates>(DialogStates.EDITING);
  const [errorEntriesList, setErrorEntriesList] = useState<string[]>([]);
  const dialogRef = useDialogRef();
  const reportInstructionId = `dialog-report-instruction-${randomId()}`;

  // Cleanup any un-needed errors from the last render
  if (status === DialogStates.MIN_ERROR && entries.length > 0) {
    setStatus(DialogStates.EDITING);
  }

  const handleClose = () => {
    setIsShowReportProblemsDialog(false);
    setEntries([]);
    setStatus(DialogStates.EDITING);
    setErrorEntriesList([]);
    dialogRef.current?.close();
  };

  const handleSubmit = () => {
    setStatus(DialogStates.SENDING);
    setErrorEntriesList([]);

    if (entries.length <= 0) {
      setStatus(DialogStates.MIN_ERROR);
      return;
    }

    if (descriptionRef.current === "") {
      setStatus(DialogStates.DESCRIPTION_EMPTY_ERROR);
      return;
    }

    if (descriptionRef.current === "") {
      setStatus(DialogStates.DESCRIPTION_EMPTY_ERROR);
      return;
    }

    const url = apiUrl;
    return axios({
      url,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      data: {
        entries,
        language: i18n.language,
        description: descriptionRef.current,
      },
    })
      .then(({ data }) => {
        // Refreshes data. Needed for error cases as well since may be a mix of valid/invalid codes
        router.replace(path);

        // Report error
        if (data?.invalidSubmissionNames && data.invalidSubmissionNames?.length > 0) {
          setStatus(DialogStates.FAILED_ERROR);
          setErrorEntriesList(data.invalidSubmissionNames);
          setEntries(data.invalidSubmissionNames);
          return;
        }

        // Success, close the dialog
        setStatus(DialogStates.SENT);
        handleClose();
      })
      .catch((err) => {
        logMessage.error(err as Error);
        setStatus(DialogStates.FAILED_ERROR);
      });
  };

  return (
    <>
      <Link
        onClick={() => setIsShowReportProblemsDialog(true)}
        href={"#"}
        className="text-black visited:text-black focus:text-white-default"
        id="reportProblemButton"
      >
        <WarningIcon className="mr-2 inline-block" />
        {t("responses.reportProblems")}
      </Link>

      {isShowReportProblemsDialog && (
        <Dialog
          title={t("downloadResponsesModals.reportProblemsDialog.title")}
          dialogRef={dialogRef}
          handleClose={handleClose}
        >
          <div className="px-4">
            <div>
              {status === DialogStates.MIN_ERROR && (
                <Alert.Danger className="mb-2">
                  <Alert.Title headingTag="h3">
                    {t("downloadResponsesModals.reportProblemsDialog.errors.minEntries.title")}
                  </Alert.Title>
                  <p>
                    {t(
                      "downloadResponsesModals.reportProblemsDialog.errors.minEntries.description"
                    )}
                  </p>
                </Alert.Danger>
              )}
              {status === DialogStates.MAX_ERROR && (
                <Alert.Danger className="mb-2">
                  <Alert.Title headingTag="h3">
                    {t("downloadResponsesModals.reportProblemsDialog.errors.maxEntries.title", {
                      max: maxEntries,
                    })}
                  </Alert.Title>
                  <p>
                    {t(
                      "downloadResponsesModals.reportProblemsDialog.errors.maxEntries.description",
                      {
                        max: maxEntries,
                      }
                    )}
                  </p>
                </Alert.Danger>
              )}
              {status === DialogStates.FORMAT_ERROR && (
                <Alert.Danger className="mb-2">
                  <Alert.Title headingTag="h3">
                    {t("downloadResponsesModals.reportProblemsDialog.errors.invalidEntry.title")}
                  </Alert.Title>
                  <p>
                    {t(
                      "downloadResponsesModals.reportProblemsDialog.errors.invalidEntry.description"
                    )}
                  </p>
                </Alert.Danger>
              )}
              {status === DialogStates.FAILED_ERROR && (
                <Alert.Danger className="mb-2">
                  <Alert.Title headingTag="h3">
                    {t("downloadResponsesModals.reportProblemsDialog.errors.errorEntries.title")}
                  </Alert.Title>
                  <p>
                    {t(
                      "downloadResponsesModals.reportProblemsDialog.errors.errorEntries.description"
                    )}
                  </p>
                </Alert.Danger>
              )}
              {status === DialogStates.UNKNOWN_ERROR && (
                <Alert.Danger className="mb-2">
                  <Alert.Title headingTag="h3">
                    {t("downloadResponsesModals.reportProblemsDialog.errors.unknown.title")}
                  </Alert.Title>
                  <p>
                    {t("downloadResponsesModals.reportProblemsDialog.errors.unknown.description")}
                    <Link href={"/support"}>
                      {t(
                        "downloadResponsesModals.reportProblemsDialog.errors.unknown.descriptionLink"
                      )}
                    </Link>
                    .
                  </p>
                </Alert.Danger>
              )}
            </div>
            <div className="py-4">
              <p className="mt-2">{t("downloadResponsesModals.reportProblemsDialog.findForm")}</p>
              <p className="mb-2 mt-10 font-bold" id={reportInstructionId}>
                {t("downloadResponsesModals.reportProblemsDialog.enterFormNumbers", {
                  max: maxEntries,
                })}{" "}
                <span className="text-[#bc3332]">({t("required", { ns: "common" })})</span>
              </p>

              <LineItemEntries
                inputs={entries}
                setInputs={setEntries}
                validateInput={inputRegex}
                inputLabelId={reportInstructionId}
                maxEntries={maxEntries}
                errorEntriesList={errorEntriesList}
                status={status}
                setStatus={setStatus}
              ></LineItemEntries>

              <label
                data-testid="label"
                className="mb-2 mt-10 block font-bold"
                htmlFor="description"
                id="description-label"
              >
                {t("downloadResponsesModals.reportProblemsDialog.describeProblem")}{" "}
                <span className="text-[#bc3332]">({t("required", { ns: "common" })})</span>
              </label>

              <ValidationMessage
                show={status === DialogStates.DESCRIPTION_EMPTY_ERROR}
                messageType={MessageType.ERROR}
              >
                {t("downloadResponsesModals.reportProblemsDialog.errors.notEmpty")}
              </ValidationMessage>

              <TextArea
                id="description"
                name="description"
                className="box-border h-32 w-full rounded-md border-2 border-black-default"
                onChange={(e) => {
                  if (descriptionRef.current !== undefined) {
                    descriptionRef.current = e.target.value;
                  }
                }}
              />

              <p className="mt-8">
                {t("downloadResponsesModals.reportProblemsDialog.problemReported")}
              </p>
              <div className="mt-4 flex">
                <Button
                  className="mr-4"
                  onClick={handleSubmit}
                  disabled={status === DialogStates.SENDING}
                >
                  {status === DialogStates.SENDING
                    ? t("downloadResponsesModals.sending")
                    : t("downloadResponsesModals.reportProblemsDialog.reportProblems")}
                </Button>
                <Button theme="secondary" onClick={handleClose}>
                  {t("downloadResponsesModals.cancel")}
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};
