"use client";
import React, { useRef } from "react";
import { useTranslation } from "@i18n/client";
import { FormElementTypes } from "@lib/types";
import { useDialogRef, Dialog } from "./shared/Dialog";
import { InfoDetails } from "./shared/InfoDetails";
import { DownloadFileButton } from "./shared/DownloadFileButton";
import { Button } from "@clientComponents/globals";
import Markdown from "markdown-to-jsx";

export const ShareModalUnauthenticated = ({
  handleClose,
}: {
  handleAddType?: (type?: FormElementTypes) => void;
  handleClose: () => void;
}) => {
  const { t, i18n } = useTranslation("form-builder");
  const instructions = useRef<HTMLDivElement>(null);

  const dialog = useDialogRef();

  const currentLanguage = i18n.language;
  const alternateLanguage = i18n.language === "en" ? "fr" : "en";

  const handleCopyToClipboard = async () => {
    if ("clipboard" in navigator) {
      const stringified = instructions.current?.innerText || "";
      await navigator.clipboard.writeText(stringified);
    }
  };

  const actions = (
    <>
      <Button
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
        className="max-h-[80%] overflow-y-scroll"
      >
        <div className="p-4">
          <section>
            <Markdown options={{ forceBlock: true }}>
              {t("share.unauthenticated.description")}
            </Markdown>
            <p className="mt-8">{t("share.unauthenticated.instructions")}</p>
          </section>

          <section className="my-8">
            <h3>{t("share.unauthenticated.step1")}</h3>
            <p className="mb-4">{t("share.unauthenticated.step1Details")}</p>
            <DownloadFileButton showInfo={false} />
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

          <InfoDetails summary={t("share.seePreview")}>
            <div className="mt-4 border-4 border-dashed border-blue-focus p-5">
              <h4>{t("share.someoneHasShared", { name: t("share.formUser") })}</h4>
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
                {t("share.someoneHasShared", {
                  name: t("share.formUser", { lng: alternateLanguage }),
                })}
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
        </div>
      </Dialog>
      <div className="hidden" ref={instructions}>
        {t("share.someoneHasShared", { name: t("share.formUser", { lng: currentLanguage }) })}
        {"\n\n"}
        {t("share.toPreview", { lng: currentLanguage })}
        {"\n"}- {t("share.stepOne", { lng: currentLanguage })}
        {"\n"}
        {t("share.stepOneDetails", { lng: currentLanguage })}.{"\n\n"}-{" "}
        {t("share.stepTwo", { lng: currentLanguage })}
        {"\n"}
        {t("share.stepTwoDetailsNoHTML", { lng: currentLanguage })}
        {"\n\n"}- {t("share.stepThree", { lng: currentLanguage })}
        {"\n"}
        {t("share.stepThreeDetails", { lng: currentLanguage })}
        {"\n\n ----- \n\n"}
        {t("share.someoneHasShared", { name: t("share.formUser", { lng: alternateLanguage }) })}
        {"\n\n"}
        {t("share.toPreview", { lng: alternateLanguage })}
        {"\n"}- {t("share.stepOne", { lng: alternateLanguage })}
        {"\n"}
        {t("share.stepOneDetails", { lng: alternateLanguage })}.{"\n\n"}-{" "}
        {t("share.stepTwo", { lng: alternateLanguage })}
        {"\n"}
        {t("share.stepTwoDetailsNoHTML", { lng: alternateLanguage })}
        {"\n\n"}- {t("share.stepThree", { lng: alternateLanguage })}
        {"\n"}
        {t("share.stepThreeDetails", { lng: alternateLanguage })}
      </div>
    </div>
  );
};
