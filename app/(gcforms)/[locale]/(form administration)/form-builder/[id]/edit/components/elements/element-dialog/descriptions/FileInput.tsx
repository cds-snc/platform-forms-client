"use client";
import React from "react";

import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { Label, FileInput as FileInputComponent } from "@clientComponents/forms";

export const FileInput = ({ title }: { title: string }) => {
  return <Description title={title} />;
};

const Title = ({ title }: { title: string }) => {
  return (
    <h3 className="mb-0" data-testid="element-description-title">
      {title}
    </h3>
  );
};

const Description = ({ title }: { title: string }) => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <Title title={title} />
      <p className="mb-4">{t("addElementDialog.fileInputDefault.text1")}</p>
      <ExampleWrapper>
        <Label htmlFor="name" className="gcds-label">
          {t("addElementDialog.fileInput.label")}
        </Label>
        <FileInputComponent label="title" id="name" name={"name"} className="mb-0" />
      </ExampleWrapper>
    </div>
  );
};
