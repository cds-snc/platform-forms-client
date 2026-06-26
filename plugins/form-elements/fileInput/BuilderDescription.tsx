"use client";
import React from "react";
import Link from "next/link";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "@root/plugins/shared";
import { FileInput as FileInputComponent } from "./FileInput";
import { Label } from "@clientComponents/forms";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";
import { useTemplateStore } from "@lib/store/useTemplateStore";

const Title = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="mb-4 flex items-center space-x-3">
      <h3 data-testid="element-description-title" className="mb-0">
        {t("addElementDialog.fileInput.title")}
      </h3>
    </div>
  );
};

const WithApiDescription = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <Title />
      <p data-testid="element-description-text">
        {t("addElementDialog.fileInputWithApi.description")}
      </p>
      <ExampleWrapper>
        <Label htmlFor="name" className="gcds-label">
          {t("addElementDialog.fileInput.label")}
        </Label>
        <FileInputComponent label="title" id="name" name={"name"} className="mb-0" />
      </ExampleWrapper>
    </div>
  );
};

const DefaultDescription = ({ link }: { link: string }) => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <Title />
      <p className="mb-4">{t("addElementDialog.fileInputDefault.text1")}</p>
      <p className="mb-8">
        <strong>
          {t("addElementDialog.fileInputDefault.text1x")}{" "}
          <Link href={link}>{t("addElementDialog.fileInputDefault.text2")}</Link>{" "}
          {t("addElementDialog.fileInputDefault.text3")}
        </strong>
      </p>
      <ExampleWrapper>
        <Label htmlFor="name" className="gcds-label">
          {t("addElementDialog.fileInput.label")}
        </Label>
        <FileInputComponent label="title" id="name" name={"name"} className="mb-0" />
      </ExampleWrapper>
    </div>
  );
};

const FileInputDescription = () => {
  const { hasApiKeyId } = useFormBuilderConfig();
  const { translationLanguagePriority, id } = useTemplateStore((s) => ({
    id: s.id,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const formId = id || "0000";
  const link = `/${translationLanguagePriority}/form-builder/${formId}/settings/api-integration`;

  return hasApiKeyId ? <WithApiDescription /> : <DefaultDescription link={link} />;
};

export default FileInputDescription;
