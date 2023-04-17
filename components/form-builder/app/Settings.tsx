import React from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { DownloadFileButton } from "./shared";

const Label = ({ htmlFor, children }: { htmlFor: string; children?: JSX.Element | string }) => {
  return (
    <label className="block font-bold mb-1" htmlFor={htmlFor}>
      {children}
    </label>
  );
};

const HintText = ({ id, children }: { id: string; children?: JSX.Element | string }) => {
  return (
    <span className="block text-sm mb-1" id={id}>
      {children}
    </span>
  );
};

export const Settings = () => {
  const { t } = useTranslation("form-builder");
  const router = useRouter();
  const { downloadconfirm } = router.query;

  return (
    <>
      <h1 className="visually-hidden">{t("formSettings")}</h1>
      <div id="download-form" className="mb-6">
        <Label htmlFor="download">{t("formDownload.title")}</Label>
        <HintText id="download-hint">{t("formDownload.description")}</HintText>
        <div className="mt-5">
          <DownloadFileButton autoShowDialog={Boolean(downloadconfirm) || false} />
        </div>
      </div>
    </>
  );
};
