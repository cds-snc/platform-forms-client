import React from "react";
import { useTranslation } from "next-i18next";
import { ExampleWrapper } from "./ExampleWrapper";
import { Label, FileInput as FileInputComponent } from "@components/forms";

export const FileInput = ({ title }: { title: string }) => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <h3 className="mb-0">{title}</h3>
      <p>{t("addElementDialog.fileInput.description")}</p>

      <ExampleWrapper className="mt-4">
        <Label htmlFor="name" className="gc-label">
          Upload a file
        </Label>
        <FileInputComponent label="title" id="name" name={"name"} />
      </ExampleWrapper>
    </div>
  );
};
