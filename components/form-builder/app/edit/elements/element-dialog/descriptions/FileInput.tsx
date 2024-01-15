import React from "react";
import { useTranslation } from "next-i18next";
import { ExampleWrapper } from "./ExampleWrapper";
import { Description, Label, FileInput as FileInputComponent } from "@components/forms";

export const FileInput = ({ title }: { title: string }) => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <h3>{title}</h3>
      <p>{t("addElementDialog.fileInput.description")}</p>

      <ExampleWrapper className="mt-4">
        <Label htmlFor="name" className="gc-label">
          Enter a specific answer
        </Label>
        <Description>For example: a name or number</Description>
        <FileInputComponent label="title" name={"name"} />
      </ExampleWrapper>
    </div>
  );
};
