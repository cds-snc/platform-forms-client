import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { FormElementTypes } from "@lib/types";
import axios from "axios";

import { useDialogRef, Dialog, TagInput, Button, InfoDetails } from "./shared";
import { useTemplateStore } from "../store";
import { useSession } from "next-auth/react";
import Markdown from "markdown-to-jsx";

export const ShareModal = ({
  handleClose,
}: {
  handleAddType?: (type?: FormElementTypes) => void;
  handleClose: () => void;
}) => {
  const { t, i18n } = useTranslation("form-builder");
  const [emails, setEmails] = useState<string[]>([]);
  const [status, setStatus] = useState<"ready" | "sent" | "sending" | "error">("ready");
  const { data } = useSession();

  const dialog = useDialogRef();

  const currentLanguage = i18n.language;
  const alternateLanguage = i18n.language === "en" ? "fr" : "en";

  const { getSchema, name, form } = useTemplateStore((s) => ({
    getSchema: s.getSchema,
    name: s.name,
    form: s.form,
  }));

  const validateEmail = (email: string) => {
    /* eslint-disable-next-line */
    return new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).test(email);
  };

  const handleSend = async () => {
    setStatus("sending");
    const filename = name ? name : i18n.language === "fr" ? form.titleFr : form.titleEn;
    try {
      await axios({
        url: "/api/share",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: { name, form: getSchema(), emails: emails, filename },
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
    }
  };

  const actions = (
    <>
      <Button
        theme="primary"
        onClick={() => {
          handleSend();
          setEmails([]);
        }}
      >
        {t("send")}
      </Button>
      <Button
        className="ml-4"
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
        theme="primary"
        onClick={() => {
          dialog.current?.close();
          handleClose();
        }}
      >
        {t("close")}
      </Button>
      <Button
        className="ml-4"
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
        className="overflow-y-scroll max-h-[80%]"
      >
        <div className="py-4">
          {status === "error" && (
            <>
              <p className="text-red-default">{t("share.messageError")}</p>
            </>
          )}
          {status === "sent" && (
            <>
              <p>{t("share.messageSent")}</p>
            </>
          )}
          {status === "ready" && (
            <>
              <p>{t("share.message")}</p>
              <div className="mt-5 mb-5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t("share.emailLabel")}
                </label>
                <TagInput tags={emails} setTags={setEmails} validateTag={validateEmail} />
              </div>
              <InfoDetails summary={t("share.seePreview")}>
                <div className="p-5 border-4 border-dashed border-blue-focus mt-4">
                  <h4>{t("share.someoneHasShared", { name: data?.user.name })}</h4>
                  <div className="mt-4">
                    {t("share.toPreview")}
                    <ul>
                      <li className="list-disc">
                        <strong>{t("share.stepOne", { lng: currentLanguage })}</strong>
                        <br />
                        {t("share.stepOneDetails", { lng: currentLanguage })}.
                      </li>
                      <li className="list-disc">
                        <strong>{t("share.stepTwo", { lng: currentLanguage })}</strong>
                        <br />
                        <Markdown options={{ forceBlock: true }}>
                          {t("share.stepTwoDetails", { lng: currentLanguage })}
                        </Markdown>
                      </li>
                      <li className="list-disc">
                        <strong>{t("share.stepThree", { lng: currentLanguage })}</strong>
                        <br />
                        {t("share.stepThreeDetails", { lng: currentLanguage })}
                      </li>
                    </ul>
                  </div>

                  <h4 className="mt-4">
                    {t("share.someoneHasShared", { name: data?.user.name, lng: alternateLanguage })}
                  </h4>
                  <div className="mt-4">
                    {t("share.toPreview", { lng: alternateLanguage })}
                    <ul>
                      <li className="list-disc">
                        <strong>{t("share.stepOne", { lng: alternateLanguage })}</strong>
                        <br />
                        {t("share.stepOneDetails", { lng: alternateLanguage })}.
                      </li>
                      <li className="list-disc">
                        <strong>{t("share.stepTwo", { lng: alternateLanguage })}</strong>
                        <br />
                        <Markdown options={{ forceBlock: true }}>
                          {t("share.stepTwoDetails", { lng: alternateLanguage })}
                        </Markdown>
                      </li>
                      <li className="list-disc">
                        <strong>{t("share.stepThree", { lng: alternateLanguage })}</strong>
                        <br />
                        {t("share.stepThreeDetails", { lng: alternateLanguage })}
                      </li>
                    </ul>
                  </div>
                </div>
              </InfoDetails>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
};
