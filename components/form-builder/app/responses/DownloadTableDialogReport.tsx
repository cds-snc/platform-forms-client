import React, { useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import { useDialogRef, Dialog, TextArea } from "@components/form-builder/app/shared";
import { LineItemEntries } from "./line-item-entries";
import { Button, Alert } from "@components/globals";
import { randomId } from "@lib/clientHelpers";
import axios from "axios";
import { useRouter } from "next/router";
import { logMessage } from "@lib/logger";
import Link from "next/link";
import { isFormId } from "@lib/validation";
import { DialogStates } from "./DownloadTableDialogTypes";

export const DownloadTableDialogReport = ({
  isShow,
  setIsShow,
  apiUrl,
  inputRegex = isFormId,
  maxEntries = 20,
}: {
  isShow: boolean;
  setIsShow: React.Dispatch<React.SetStateAction<boolean>>;
  apiUrl: string;
  inputRegex?: (field: string) => boolean;
  maxEntries?: number;
}) => {
  const { t } = useTranslation(["form-builder-responses", "common"]);
  const router = useRouter();
  const [entries, setEntries] = useState<string[]>([]);
  const descriptionRef = useRef("");
  const [status, setStatus] = useState<DialogStates>(DialogStates.EDITTING);
  const [errorEntriesList, setErrorEntriesList] = useState<string[]>([]);
  const dialogRef = useDialogRef();
  // TODO rename to report but check tests first
  const confirmInstructionId = `dialog-confirm-receipt-instruction-${randomId()}`;

  // Cleanup any un-needed errors from the last render
  if (status === DialogStates.MIN_ERROR && entries.length > 0) {
    setStatus(DialogStates.EDITTING);
  }

  const handleClose = () => {
    setIsShow(false);
    setEntries([]);
    setStatus(DialogStates.EDITTING);
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
        description: descriptionRef.current,
      },
    })
      .then(({ data }) => {
        // Refreshes data. Needed for error cases as well since may be a mix of valid/invalid codes
        router.replace(router.asPath);

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
        setStatus(DialogStates.UNKNOWN_ERROR);
      });
  };

  return (
    <>
      {isShow && (
        <Dialog
          title={t("downloadResponsesModals.reportProblemsDialog.title")}
          dialogRef={dialogRef}
          handleClose={handleClose}
          headerStyle="inline-block ml-12 mt-12"
        >
          <div className="px-10">
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
                    <Link href={"/form-builder/support"}>
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
              <p className="mb-2 mt-10 font-bold" id={confirmInstructionId}>
                {t("downloadResponsesModals.reportProblemsDialog.enterFormNumbers", {
                  max: maxEntries,
                })}{" "}
                <span className="text-[#bc3332]">({t("required", { ns: "common" })})</span>
              </p>

              <LineItemEntries
                inputs={entries}
                setInputs={setEntries}
                validateInput={inputRegex}
                spellCheck={false}
                inputLabelId={confirmInstructionId}
                maxEntries={maxEntries}
                errorEntriesList={errorEntriesList}
                status={status}
                setStatus={setStatus}
              ></LineItemEntries>

              <label
                data-testid="label"
                className="block mb-2 mt-10 font-bold"
                htmlFor="description"
                id="description-label"
              >
                {t("downloadResponsesModals.reportProblemsDialog.describeProblem")}{" "}
                <span className="text-[#bc3332]">({t("required", { ns: "common" })})</span>
              </label>
              <div
                role="alert"
                className={`border-l-4 border-red bg-red-50 p-3 ${
                  status !== DialogStates.DESCRIPTION_EMPTY_ERROR ? "visually-hidden" : ""
                }`}
              >
                {status === DialogStates.DESCRIPTION_EMPTY_ERROR && (
                  <p className="text-sm font-bold">
                    {t("downloadResponsesModals.reportProblemsDialog.errors.notEmpty")}
                  </p>
                )}
              </div>
              <TextArea
                id="description"
                name="description"
                className="h-32 w-full box-border border-black-default border-2 rounded-md"
                onChange={(e) => {
                  if (descriptionRef.current !== undefined) {
                    descriptionRef.current = e.target.value;
                  }
                }}
              />

              <p className="mt-8">
                {t("downloadResponsesModals.reportProblemsDialog.problemReported")}
              </p>
              <div className="my-8 flex">
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
