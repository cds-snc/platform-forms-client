import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { FormElementTypes } from "@lib/types";
import axios from "axios";

import { useDialogRef, Dialog, TagInput, Button } from "./shared";
import { useTemplateStore } from "../store";
import { useSession } from "next-auth/react";
import { AddIcon, RemoveIcon } from "../icons";
import Markdown from "markdown-to-jsx";

export const ShareModal = ({
  handleClose,
}: {
  handleAddType?: (type?: FormElementTypes) => void;
  handleClose: () => void;
}) => {
  const { t } = useTranslation("form-builder");
  const [emails, setEmails] = useState<string[]>([]);
  const [status, setStatus] = useState<"ready" | "sent" | "sending" | "error">("ready");
  const { data } = useSession();

  const dialog = useDialogRef();

  const { getSchema } = useTemplateStore((s) => ({
    getSchema: s.getSchema,
  }));

  const validateEmail = (email: string) => {
    /* eslint-disable-next-line */
    return new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).test(email);
  };

  const handleSend = async () => {
    setStatus("sending");
    await axios({
      url: "/api/share",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: { form: getSchema(), emails: emails },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    });
    setStatus("sent");
  };

  const actions = (
    <>
      <Button
        className="ml-5"
        theme="primary"
        onClick={() => {
          handleSend();
          setEmails([]);
        }}
      >
        {t("send")}
      </Button>
      <Button
        className="ml-5"
        theme="secondary"
        onClick={() => {
          dialog.current?.close();
          handleClose();
        }}
      >
        {t("cancel")}
      </Button>
    </>
  );

  const doneActions = (
    <>
      <Button
        className="ml-5"
        theme="primary"
        onClick={() => {
          dialog.current?.close();
          handleClose();
        }}
      >
        {t("close")}
      </Button>
      <Button
        className="ml-5"
        theme="secondary"
        onClick={() => {
          setStatus("ready");
        }}
      >
        {t("share.startOver")}
      </Button>
    </>
  );

  return (
    <div className="form-builder">
      <Dialog
        title={t("share.title")}
        dialogRef={dialog}
        handleClose={handleClose}
        actions={status === "ready" ? actions : doneActions}
      >
        <div className="p-4">
          {status === "sent" && (
            <>
              <p>{t("share.messageSent")}</p>
            </>
          )}
          {status === "ready" && (
            <>
              <p>{t("share.message")}</p>
              <div className="mt-5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t("share.emailLabel")}
                </label>
                <TagInput tags={emails} setTags={setEmails} validateTag={validateEmail} />
              </div>
              <details className="group mt-5">
                <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer">
                  {t("share.seePreview")}
                  <span className="inline group-open:hidden">
                    <AddIcon className="inline" />
                  </span>
                  <span className="hidden group-open:inline">
                    <RemoveIcon className="inline" />
                  </span>
                </summary>
                <div className="p-5 border-4 border-dashed border-blue-focus mt-4">
                  <h4>{t("share.someoneHasShared", { name: data?.user.name })}</h4>
                  <div className="mt-4">
                    {t("share.toPreview")}
                    <ul>
                      <li className="list-disc">
                        <strong>{t("share.stepOne")}</strong>
                        <br />
                        {t("share.stepOneDetails")}.
                      </li>
                      <li className="list-disc">
                        <strong>{t("share.stepTwo")}</strong>
                        <br />
                        <Markdown options={{ forceBlock: true }}>
                          {t("share.stepTwoDetails")}
                        </Markdown>
                      </li>
                      <li className="list-disc">
                        <strong>{t("share.stepThree")}</strong>
                        <br />
                        {t("share.stepThreeDetails")}
                      </li>
                    </ul>
                  </div>
                </div>
              </details>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
};
