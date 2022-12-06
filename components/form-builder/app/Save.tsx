import React from "react";
import { useTranslation } from "next-i18next";
import { DownloadFileButton } from "./shared/DownloadFileButton";
import { CopyToClipboard } from "./shared/CopyToClipboard";
import { Output } from "./shared/Output";
import { withMessage } from "./shared/Button";

export const Save = () => {
  const { t } = useTranslation("form-builder");

  const DownloadFileButtonWithMessage = withMessage(DownloadFileButton, t("saveDownloadMessage"));

  return (
    <>
      <h1 className="border-b-0 mb-8 md:text-h1">{t("saveYourProgress")}</h1>
      <p className="mb-6">{t("saveP1")}</p>
      <p className="mb-6">{t("saveP2")}</p>
      <br />

      <h2 className="text-[24px]">
        <span className="inline-block py-1.5 p-3 mr-3 bg-black-default text-white-default leading-none rounded-full">
          1
        </span>
        <span>{t("saveH2")}</span>
      </h2>
      <p className="mb-6">{t("saveP3")}</p>
      <h2 className="text-[24px]">
        <span className="inline-block py-1.5 p-3 mr-3 bg-black-default text-white-default leading-none rounded-full">
          2
        </span>
        <span>{t("saveH3")}</span>
      </h2>
      <p className="mb-6">{t("saveP4")}</p>

      <div className="mb-6">
        <DownloadFileButtonWithMessage />
      </div>

      <details>
        <summary className="cursor-pointer underline mb-6">{t("viewCode")}</summary>
        <CopyToClipboard />
        <Output />
      </details>
    </>
  );
};
