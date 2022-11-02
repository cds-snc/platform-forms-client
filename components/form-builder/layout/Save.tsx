import React from "react";
import { useTranslation } from "next-i18next";
import { DownloadFileButton } from "./DownloadFileButton";
import { CopyToClipboard } from "./CopyToClipboard";
import { Output } from "./Output";

export const Save = () => {
  const { t } = useTranslation("form-builder");

  return (
    <>
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
        <DownloadFileButton />
      </div>

      <details>
        <summary className="cursor-pointer underline mb-6">{t("viewCode")}</summary>

        <CopyToClipboard />
        <Output />
      </details>
    </>
  );
};
