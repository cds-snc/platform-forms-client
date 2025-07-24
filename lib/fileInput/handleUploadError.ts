import { TFunction } from "i18next";
import { FileUploadError } from "@root/app/(gcforms)/[locale]/(form filler)/id/[...props]/lib/client/exceptions";

export const handleUploadError = (
  error: Error,
  t: TFunction
): undefined | { heading: string; message: string } => {
  if (error instanceof FileUploadError && error.file) {
    const { file } = error;
    const message = t("input-validation.file-upload.file-size-too-large", {
      fileName: file.name,
      fileSize: file.size,
    });

    return {
      heading: t("input-validation.file-upload.heading"),
      message,
    };
  }
};
