import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { FormElementTypes } from "@lib/types";

import { useDialogRef, Dialog, TagInput, Button } from "./shared";
import axios from "axios";
import { useTemplateStore } from "../store";
import { useSession } from "next-auth/react";
import { AddIcon, RemoveIcon } from "../icons";

export const ShareModal = ({
  handleClose,
}: {
  handleAddType?: (type?: FormElementTypes) => void;
  handleClose: () => void;
}) => {
  const { t } = useTranslation("form-builder");
  const [emails, setEmails] = useState<string[]>([]);
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
    await axios({
      url: "/api/share",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: { form: getSchema(), emails: emails },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    });
  };

  const actions = (
    <>
      <Button
        className="ml-5"
        theme="primary"
        onClick={() => {
          dialog.current?.close();
          handleSend();
          handleClose();
        }}
      >
        {t("Send")}
      </Button>
      <Button
        className="ml-5"
        theme="secondary"
        onClick={() => {
          dialog.current?.close();
          handleClose();
        }}
      >
        {t("Cancel")}
      </Button>
    </>
  );

  return (
    <div className="form-builder">
      <Dialog dialogRef={dialog} handleClose={handleClose} actions={actions}>
        <div className="p-4">
          <h3 className="mb-5">{t("share.title")}</h3>
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
                    {t("share.stepTwoDetails")}
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
        </div>
      </Dialog>
    </div>
  );
};
