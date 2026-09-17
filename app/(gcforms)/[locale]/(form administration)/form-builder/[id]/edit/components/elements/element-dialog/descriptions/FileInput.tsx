"use client";

import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { Label, FileInput as FileInputComponent } from "@clientComponents/forms";

export const FileInput = ({ title }: { title: string }) => {
  return <DefaultDescription title={title} />;
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

const DefaultDescription = ({ title }: { title: string }) => {
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
