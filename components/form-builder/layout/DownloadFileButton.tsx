import React, { useCallback } from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";

import { useTemplateStore } from "../store/useTemplateStore";
import { FancyButton } from "../panel/Button";

const PrimaryButton = styled(FancyButton)`
  padding: 10px 15px;
  background: #26374a;
  box-shadow: inset 0 -2px 0 #515963;
  color: white;

  &:hover:not(:disabled),
  &:active,
  &:focus {
    color: #ffffff;
    background: #1c578a;
    box-shadow: inset 0 -2px 0 #7a8796;
  }

  &:hover:active {
    background: #16446c;
  }
`;

const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getDate = () => {
  let date = new Date();
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - offset * 60 * 1000);
  return date.toISOString().split("T")[0];
};

export const DownloadFileButton = () => {
  const { t } = useTranslation("form-builder");
  const { getSchema, form } = useTemplateStore((s) => ({
    getSchema: s.getSchema,
    form: s.form,
  }));
  const downloadfile = useCallback(async () => {
    async function retrieveFileBlob() {
      try {
        const blob = new Blob([getSchema()], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = slugify(`${form.titleEn}-${getDate()}`);
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        alert("error creating file download");
      }
    }

    retrieveFileBlob();
  }, [getSchema]);
  return <PrimaryButton onClick={downloadfile}>{t("saveButton")}</PrimaryButton>;
};
