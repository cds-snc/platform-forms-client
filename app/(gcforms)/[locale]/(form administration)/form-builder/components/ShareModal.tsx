"use client";
import React, { useState } from "react";
import { useTranslation } from "@i18n/client";
import { FormElementTypes } from "@lib/types";

import { useDialogRef, Dialog } from "./shared/Dialog";
import { InfoDetails } from "./shared/InfoDetails";
import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useSession } from "next-auth/react";
import Markdown from "markdown-to-jsx";

import { shareForm } from "../actions";
import { Loader } from "@clientComponents/globals/Loader";
import { EmailTags } from "./shared/email-tags/EmailTags";

const Loading = () => (
  <div className="flex h-full items-center justify-center ">
    <Loader />
  </div>
);

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

  const { formId, name, form } = useTemplateStore((s) => ({
    formId: s.id,
    name: s.name,
    form: s.form,
  }));

  const handleSend = async () => {
    setStatus("sending");
    const filename = name ? name : i18n.language === "fr" ? form.titleFr : form.titleEn;
    try {
      if (!emails.length) {
        setStatus("error");
        return;
      }

      const result = await shareForm({ emails, formId, filename });

      if (result.error) {
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch (err) {
      setStatus("error");
    }
  };

  const actions = (
    <>
      <Button
        data-share="form-builder-email"
        theme="primary"
        disabled={status === "sending" || !emails.length}
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
        className="max-h-[80%]"
      >
        <div className="p-4">
          {status === "error" && (
            <>
              <p className="text-red-default">{t("share.messageError")}</p>
            </>
          )}

          {status === "sending" && <Loading />}

          {status === "sent" && (
            <>
              <p>{t("share.messageSent")}</p>
            </>
          )}
          {status === "ready" && (
            <>
              <p>{t("share.message")}</p>

              <EmailTags tags={emails} setTags={setEmails} />

              <InfoDetails summary={t("share.seePreview")}>
                <div className="mt-4 border-4 border-dashed border-blue-focus p-5">
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

                  <hr className="my-6" />

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
