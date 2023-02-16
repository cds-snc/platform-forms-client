import React, { useCallback, useRef } from "react";
import { useTranslation } from "next-i18next";
import { FormElementTypes } from "@lib/types";

import { useDialogRef, Dialog, Button } from "./shared";
import { useTemplateStore } from "../store";
import { AddIcon, RemoveIcon } from "../icons";
import Markdown from "markdown-to-jsx";

export const ShareModalUnauthenticated = ({
  handleClose,
}: {
  handleAddType?: (type?: FormElementTypes) => void;
  handleClose: () => void;
}) => {
  const { t } = useTranslation("form-builder");
  const instructions = useRef<HTMLDivElement>(null);

  const dialog = useDialogRef();

  const { getSchema } = useTemplateStore((s) => ({
    getSchema: s.getSchema,
  }));

  const handleCopyToClipboard = async () => {
    if ("clipboard" in navigator) {
      const stringified = instructions.current?.innerText || "";
      await navigator.clipboard.writeText(stringified);
    }
  };

  const handleDownloadJson = useCallback(async () => {
    async function retrieveFileBlob() {
      try {
        const blob = new Blob([getSchema()], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "form.json";
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        alert("error creating file download");
      }
    }

    retrieveFileBlob();
  }, [getSchema]);

  const actions = (
    <>
      <Button
        className="ml-5"
        theme="secondary"
        onClick={() => {
          dialog.current?.close();
          handleClose();
        }}
      >
        {t("close")}
      </Button>
    </>
  );

  return (
    <div className="form-builder">
      <Dialog
        title={t("share.title")}
        dialogRef={dialog}
        handleClose={handleClose}
        actions={actions}
      >
        <div className="my-8">
          <section>
            <p>
              <Markdown options={{ forceBlock: true }}>
                {t("share.unauthenticated.description")}
              </Markdown>
            </p>

            <p className="mt-8">{t("share.unauthenticated.instructions")}</p>
          </section>

          <section className="my-8">
            <h3>{t("share.unauthenticated.step1")}</h3>
            <p>{t("share.unauthenticated.step1Details")}</p>
            <Button
              theme="secondary"
              className="mt-4"
              onClick={() => {
                handleDownloadJson();
              }}
            >
              {t("share.unauthenticated.downloadFormFile")}
            </Button>
          </section>

          <section className="my-8">
            <h3>{t("share.unauthenticated.step2")}</h3>
            <p>{t("share.unauthenticated.step2Details")}</p>
            <Button
              theme="secondary"
              className="mt-4"
              onClick={() => {
                handleCopyToClipboard();
              }}
            >
              {t("share.unauthenticated.copyInstructions")}
            </Button>
          </section>

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
              <h4>{t("share.someoneHasShared", { name: t("share.formUser") })}</h4>
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
                    <Markdown options={{ forceBlock: true }}>{t("share.stepTwoDetails")}</Markdown>
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
      <div className="hidden" ref={instructions}>
        {t("share.someoneHasShared", { name: "{Name}" })}
        {"\n\n"}
        {t("share.toPreview")}
        {"\n"}- {t("share.stepOne")}
        {"\n"}
        {t("share.stepOneDetails")}.{"\n\n"}- {t("share.stepTwo")}
        {"\n"}
        {t("share.stepTwoDetailsNoHTML")}
        {"\n\n"}- {t("share.stepThree")}
        {"\n"}
        {t("share.stepThreeDetails")}
        {"\n"}
      </div>
    </div>
  );
};
