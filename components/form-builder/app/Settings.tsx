import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import Markdown from "markdown-to-jsx";

import { useTemplateStore, clearTemplateStore } from "../store";
import {
  Button,
  ConfirmFormDeleteDialog,
  useDialogRef,
  Dialog,
  DownloadFileButton,
} from "./shared";
import { useDeleteForm } from "../hooks";

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

export const Settings = () => {
  const { t } = useTranslation("form-builder");
  const { handleDelete } = useDeleteForm();
  const [formDeleted, setFormDeleted] = useState(false);
  const [error, setError] = useState(false);

  const router = useRouter();
  const { deleteconfirm, downloadconfirm } = router.query;
  const [showConfirm, setShowConfirm] = useState(deleteconfirm || false);

  const { id, initialize, isPublished } = useTemplateStore((s) => ({
    id: s.id,
    initialize: s.initialize,
    isPublished: s.isPublished,
  }));
  const { status } = useSession();

  return (
    <>
      <h1 className="visually-hidden">{t("formSettings")}</h1>

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
