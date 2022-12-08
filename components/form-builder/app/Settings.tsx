import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useTemplateStore } from "../store/useTemplateStore";
import { Button } from "./shared/Button";
import { Input } from "./shared/Input";
import { useSession } from "next-auth/react";
import { useDeleteForm } from "../hooks/useDelete";
import Markdown from "markdown-to-jsx";
import { useDialogRef, Dialog } from "./shared/Dialog";
import { ConfirmFormDeleteDialog } from "./shared/ConfirmFormDeleteDialog";
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
  const { t } = useTranslation("form-builder");

  return (
    <div id={id} className="mt-2 mb-2" role="alert">
      {isActive && (
        <>
          <h2 className="text-red text-sm font-bold pb-1">{t("settingsInvalidEmailAlertTitle")}</h2>
          <div className="bg-red-100 w-3/5 text-sm p-2">
            <span>{t("settingsInvalidEmailAlertDesc1")}</span>
            <br />
            <a href="/form-builder/support">{t("contactSupport")}</a>
            <span> {t("settingsInvalidEmailAlertDesc2")}</span>
          </div>
        </>
      )}
    </div>
  );
};

export const Settings = () => {
  const { t } = useTranslation("form-builder");
  const { handleDelete } = useDeleteForm();
  const [formDeleted, setFormDeleted] = useState(false);
  const [error, setError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { id, initialize, email, updateField } = useTemplateStore((s) => ({
    id: s.id,
    initialize: s.initialize,
    email: s.submission.email,
    updateField: s.updateField,
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
      <div className="mb-10">
        <Label htmlFor="response-delivery">{t("settingsReponseTitle")}</Label>
        <HintText id="response-delivery-hint-1">{t("settingsReponseHint1")}</HintText>
        <HintText id="response-delivery-hint-2">{t("settingsReponseHint2")}</HintText>
        <InvalidEmailError id="invalidEmailError" isActive={IsInvalidEmailErrorActive} />
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
            initialize(); // Reset the form
          }}
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
