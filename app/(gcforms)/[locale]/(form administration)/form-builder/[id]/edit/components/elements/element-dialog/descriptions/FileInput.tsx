"use client";
import React from "react";
import Link from "next/link";

import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { Label, FileInput as FileInputComponent } from "@clientComponents/forms";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { BODY_SIZE_LIMIT_WITH_FILES } from "@root/constants";
import { bytesToMb } from "@lib/utils/fileSize";
import { BetaBadge } from "@clientComponents/globals/BetaBadge";

export const FileInput = ({ title }: { title: string }) => {
  const { hasApiKeyId } = useFormBuilderConfig();

  const { translationLanguagePriority, id } = useTemplateStore((s) => ({
    id: s.id,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const link = `/${translationLanguagePriority}/form-builder/${id}/settings`;

  return hasApiKeyId ? (
    <WithApiDescription title={title} />
  ) : (
    <DefaultDescription title={title} link={link} />
  );
};

const Title = ({ title }: { title: string }) => {
  return (
    <div className="mb-4 flex items-center space-x-4">
      <h3 className="mb-0">{title}</h3>
      <BetaBadge />
    </div>
  );
};

export const FileInputTrialDescription = () => {
  const { translationLanguagePriority, id } = useTemplateStore((s) => ({
    id: s.id,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const link = `/${translationLanguagePriority}/form-builder/${id}/settings`;

  const { t } = useTranslation("form-builder");
  return (
    <div>
      <p className="mb-4">{t("addElementDialog.fileInputWithApi.trialFeature.text1")}</p>
      <ul className="mb-8">
        <li>
          <Link href={link}>{t("addElementDialog.fileInputWithApi.trialFeature.bullet1")}</Link>
        </li>
        <li>
          {t("addElementDialog.fileInputWithApi.trialFeature.bullet2", {
            BODY_SIZE_LIMIT_WITH_FILES: bytesToMb(BODY_SIZE_LIMIT_WITH_FILES),
          })}
        </li>
        <li>{t("addElementDialog.fileInputWithApi.trialFeature.bullet3")}</li>
      </ul>
    </div>
  );
};

const WithApiDescription = ({ title }: { title: string }) => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <Title title={title} />
      <p>{t("addElementDialog.fileInputWithApi.description")}</p>
      <ExampleWrapper className="my-4">
        <Label htmlFor="name" className="gc-label">
          {t("addElementDialog.fileInput.label")}
        </Label>
        <FileInputComponent label="title" id="name" name={"name"} className="mb-0" />
      </ExampleWrapper>

      <h4 className="mb-2 font-medium">
        {t("addElementDialog.fileInputWithApi.trialFeature.title")}
      </h4>
      <FileInputTrialDescription />
      <div className="mb-4 mt-8">
        <h4 className="mb-2 font-medium">
          {t("addElementDialog.fileInputWithApi.recommendations.title")}
        </h4>
        <ul className="mb-4">
          <li>{t("addElementDialog.fileInputWithApi.recommendations.text1")}</li>
        </ul>
      </div>
    </div>
  );
};

const DefaultDescription = ({ title, link }: { title: string; link: string }) => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <Title title={title} />
      <p className="mb-8">
        {t("addElementDialog.fileInputDefault.text1")}{" "}
        <Link href={link}>{t("addElementDialog.fileInputDefault.text2")}</Link>{" "}
        {t("addElementDialog.fileInputDefault.text3")}
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
