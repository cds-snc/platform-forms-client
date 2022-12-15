import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import Markdown from "markdown-to-jsx";

import { useTemplateStore, clearTemplateStore } from "../store";
import {
  Button,
  Input,
  ConfirmFormDeleteDialog,
  useDialogRef,
  Dialog,
  DownloadFileButton,
} from "./shared";
import { useDeleteForm } from "../hooks";
import { isValidGovEmail } from "@lib/validation";

const FormDeleted = () => {
  const { t } = useTranslation("form-builder");
  const router = useRouter();
  const dialog = useDialogRef();
  const actions = (
    <Button
      onClick={() => {
        dialog.current?.close();
        router.push({ pathname: `/form-builder` });
      }}
    >
      {t("formDeletedDialogOkay")}
    </Button>
  );

  return (
    <Dialog title={t("formDeletedDialogTitle")} dialogRef={dialog} actions={actions}>
      <Markdown options={{ forceBlock: true }}>{t("formDeletedDialogMessage")}</Markdown>
    </Dialog>
  );
};

const FormDeletedError = ({ handleClose }: { handleClose: () => void }) => {
  const { t } = useTranslation("form-builder");
  const dialog = useDialogRef();
  const actions = (
    <Button
      onClick={() => {
        dialog.current?.close();
        handleClose();
      }}
    >
      {t("formDeletedDialogOkayFailed")}
    </Button>
  );

  return (
    <Dialog title={t("formDeleteDialogTitleFailed")} dialogRef={dialog} actions={actions}>
      <Markdown options={{ forceBlock: true }}>{t("formDeletedDialogMessageFailed")}</Markdown>
    </Dialog>
  );
};

const Label = ({ htmlFor, children }: { htmlFor: string; children?: JSX.Element | string }) => {
  return (
    <label className="block font-bold mb-1" htmlFor={htmlFor}>
      {children}
    </label>
  );
};

const HintText = ({ id, children }: { id: string; children?: JSX.Element | string }) => {
  return (
    <span className="block text-sm mb-1" id={id}>
      {children}
    </span>
  );
};

const InvalidEmailError = ({ id, isActive }: { id: string; isActive: boolean }) => {
  const { t, i18n } = useTranslation("form-builder");

  return (
    <div id={id} className="mt-2 mb-2" role="alert">
      {isActive && (
        <>
          <h2 className="text-red text-sm font-bold pb-1">{t("settingsInvalidEmailAlertTitle")}</h2>
          <div className="bg-red-100 w-3/5 text-sm p-2">
            <span>{t("settingsInvalidEmailAlertDesc1")}</span>
            <br />
            <a href={`/${i18n.language}/form-builder/support`} target="_blank" rel="noreferrer">
              {t("contactSupport")}
            </a>
            <span> {t("settingsInvalidEmailAlertDesc2")}</span>
          </div>
        </>
      )}
    </div>
  );
};

export const Settings = () => {
  const { t, i18n } = useTranslation("form-builder");
  const { handleDelete } = useDeleteForm();
  const [formDeleted, setFormDeleted] = useState(false);
  const [error, setError] = useState(false);

  const router = useRouter();
  const { deleteconfirm, downloadconfirm } = router.query;
  const [showConfirm, setShowConfirm] = useState(deleteconfirm || false);

  const { id, initialize, email, updateField, isPublished } = useTemplateStore((s) => ({
    id: s.id,
    initialize: s.initialize,
    email: s.submission.email,
    updateField: s.updateField,
    isPublished: s.isPublished,
  }));
  const { status } = useSession();
  const [inputEmail, setInputEmail] = useState(email ?? "");
  const [IsInvalidEmailErrorActive, setIsInvalidEmailErrorActive] = useState(false);

  const handleEmailChange = (email: string) => {
    setInputEmail(email);

    const completeEmailAddressRegex =
      /^([a-zA-Z0-9!#$%&'*+-/=?^_`{|}~.])+@([a-zA-Z0-9-.]+)\.([a-zA-Z0-9]{2,})+$/;

    // We want to make sure the email address is complete before validating it
    if (!completeEmailAddressRegex.test(email)) {
      setIsInvalidEmailErrorActive(false);
      return;
    }

    if (isValidGovEmail(email)) {
      setIsInvalidEmailErrorActive(false);
      updateField(`submission.email`, email);
    } else {
      setIsInvalidEmailErrorActive(true);
    }
  };

  return (
    <>
      <h1 className="visually-hidden">{t("formSettings")}</h1>

      {isPublished && (
        <div className="mb-10">
          <Label htmlFor="response-delivery">{t("settingsResponseTitle")}</Label>
          <HintText id="response-delivery-hint-1">{t("settingsResponseHint1")}</HintText>
          <HintText id="response-delivery-hint-2">{t("settingsResponseHint2")}</HintText>
          <div className="mt-4 mb-4 p-4 bg-purple-200 text-sm inline-block">
            {t("settingsResponseNotePublished")}
            <a
              href={`/${i18n.language}/form-builder/support`}
              className="ml-2"
              target="_blank"
              rel="noreferrer"
            >
              {t("contactSupport")}
            </a>
            .
          </div>
          <div>{inputEmail}</div>
        </div>
      )}

      {!isPublished && (
        <div className="mb-10">
          <Label htmlFor="response-delivery">{t("settingsResponseTitle")}</Label>
          <HintText id="response-delivery-hint-1">{t("settingsResponseHint1")}</HintText>
          <HintText id="response-delivery-hint-2">{t("settingsResponseHint2")}</HintText>
          <div className="mt-4 p-4 bg-purple-200 text-sm inline-block">
            {t("settingsResponseNote")}
            <a
              href={`/${i18n.language}/form-builder/support`}
              className="ml-2"
              target="_blank"
              rel="noreferrer"
            >
              {t("contactSupport")}
            </a>
            .
          </div>
          <InvalidEmailError id="invalidEmailError" isActive={IsInvalidEmailErrorActive} />

          <div className="block font-bold mb-1 text-sm">{t("settingsResponseEmailTitle")}</div>
          <Input
            id="response-delivery"
            isInvalid={IsInvalidEmailErrorActive}
            describedBy="response-delivery-hint-1 response-delivery-hint-2 invalidEmailError"
            value={inputEmail}
            theme={IsInvalidEmailErrorActive ? "error" : "default"}
            className="w-3/5"
            onChange={(e) => handleEmailChange(e.target.value)}
          />
        </div>
      )}

      <div id="download-form" className="mb-6">
        <Label htmlFor="download">{t("formDownload.title")}</Label>
        <HintText id="download-hint">{t("formDownload.description")}</HintText>
        <div className="mt-5">
          <DownloadFileButton autoShowDialog={Boolean(downloadconfirm) || false} />
        </div>
      </div>

      {status === "authenticated" && id && (
        <div className="mb-10">
          <Label htmlFor="delete">{t("settingsDeleteTitle")}</Label>
          <HintText id="delete-hint">{t("settingsDeleteHint")}</HintText>
          <div className="mt-4">
            <Button
              id="delete-form"
              theme="destructive"
              onClick={async () => {
                setShowConfirm(true);
              }}
            >
              {t("settingsDeleteButton")}
            </Button>
          </div>
        </div>
      )}
      {showConfirm && (
        <ConfirmFormDeleteDialog
          handleClose={() => setShowConfirm(false)}
          handleConfirm={async () => {
            const result = await handleDelete(id);
            if (result && "error" in result) {
              setError(true);
              return;
            }
            setFormDeleted(true);
            clearTemplateStore();
            initialize(); // Reset the form
          }}
          isPublished={isPublished}
        />
      )}
      {formDeleted && <FormDeleted />}
      {error && (
        <FormDeletedError
          handleClose={() => {
            setError(false);
          }}
        />
      )}
    </>
  );
};
