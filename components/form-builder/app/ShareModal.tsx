import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { FormElementTypes } from "@lib/types";

import { useDialogRef, Dialog, TagInput, Button } from "./shared";
import axios from "axios";
import { useTemplateStore } from "../store";

export const ShareModal = ({
  handleClose,
}: {
  handleAddType?: (type?: FormElementTypes) => void;
  handleClose: () => void;
}) => {
  const { t } = useTranslation("form-builder");
  const [emails, setEmails] = useState<string[]>([]);

  const dialog = useDialogRef();

  const { getSchema } = useTemplateStore((s) => ({
    getSchema: s.getSchema,
  }));

  const validateEmail = (email: string) => {
    /* eslint-disable-next-line */
    return new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(email);
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
          <p>
            People you share to will receive an email with an attached JSON file. They can view the
            JSON form file using GC Forms, no account required.
          </p>

          <div className="mt-5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Enter email address
            </label>
            <TagInput tags={emails} setTags={setEmails} validateTag={validateEmail} />
          </div>

          <details className="group mt-5">
            <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer">
              See a preview of the email message
              <span className="inline group-open:hidden">+</span>
              <span className="hidden group-open:inline">-</span>
            </summary>
            <div className="p-5 border-4 border-dashed border-blue-focus mt-4">
              <h4>Steve From Accounting has shared a GC Form with you</h4>
              <p className="mt-4">
                To preview this form:
                <ul>
                  <li className="list-disc">
                    <strong>Step 1:</strong>
                    <br />
                    Save the attached JSON form file to your computer.
                  </li>
                  <li className="list-disc">
                    <strong>Step 2:</strong>
                    <br />
                    Go to GC Forms. No account needed.
                  </li>
                  <li className="list-disc">
                    <strong>Step 3:</strong>
                    <br />
                    Select open a form file.
                  </li>
                </ul>
              </p>
            </div>
          </details>
        </div>
      </Dialog>
    </div>
  );
};
