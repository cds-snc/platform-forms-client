import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { FormElementTypes } from "@lib/types";

import { useDialogRef, Dialog, TagInput, Button } from "./shared";

export const ShareModal = ({
  handleClose,
}: {
  handleAddType?: (type?: FormElementTypes) => void;
  handleClose: () => void;
}) => {
  const { t } = useTranslation("form-builder");
  const [tags, setTags] = useState<string[]>([]);

  const dialog = useDialogRef();

  const handleSend = () => {
    //
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
            <TagInput tags={tags} setTags={setTags} />
          </div>

          <div className="mt-5">See a preview of the email message +</div>
        </div>
      </Dialog>
    </div>
  );
};
