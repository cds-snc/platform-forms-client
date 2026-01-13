"use client";
import React from "react";
import Link from "next/link";

import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { Label, FileInput as FileInputComponent } from "@clientComponents/forms";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";
import { useTemplateStore } from "@lib/store/useTemplateStore";

export const FileInput = ({ title }: { title: string }) => {
  const { hasApiKeyId } = useFormBuilderConfig();

  const { translationLanguagePriority, id } = useTemplateStore((s) => ({
    id: s.id,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const formId = id || "0000";

  const link = `/${translationLanguagePriority}/form-builder/${formId}/settings/api-integration`;

  return hasApiKeyId ? (
    <WithApiDescription title={title} />
  ) : (
    <DefaultDescription title={title} link={link} />
  );
};

const Title = ({ title }: { title: string }) => {
  return (
    <div className="mb-4 flex items-center space-x-3">
      <h3 data-testid="element-description-title" className="mb-0">
        {title}
      </h3>
    </div>
  );
};

const WithApiDescription = ({ title }: { title: string }) => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <Title title={title} />
      <p data-testid="element-description-text">
        {t("addElementDialog.fileInputWithApi.description")}
      </p>
      <ExampleWrapper className="my-4">
        <Label htmlFor="name" className="gc-label">
          {t("addElementDialog.fileInput.label")}
        </Label>
        <FileInputComponent label="title" id="name" name={"name"} className="mb-0" />
      </ExampleWrapper>
    </div>
  );
};

const DefaultDescription = ({ title, link }: { title: string; link: string }) => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <Title title={title} />
      <p className="mb-4">{t("addElementDialog.fileInputDefault.text1")}</p>
      <p className="mb-8">
        <strong>
          {t("addElementDialog.fileInputDefault.text1x")}{" "}
          <Link href={link}>{t("addElementDialog.fileInputDefault.text2")}</Link>{" "}
          {t("addElementDialog.fileInputDefault.text3")}
        </strong>
      </p>
      <ExampleWrapper className="mt-4">
        <Label htmlFor="name" className="gc-label">
          {t("addElementDialog.fileInput.label")}
        </Label>
        <FileInputComponent label="title" id="name" name={"name"} className="mb-0" />
      </ExampleWrapper>
    </div>
  );
};
