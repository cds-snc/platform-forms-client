import { TFunction } from "i18next";
import { FileUploadError } from "@root/app/(gcforms)/[locale]/(form filler)/id/[...props]/lib/client/exceptions";
import { isIndividualFileSizeValid } from "@lib/validation/isIndividualFileSizeValid";

/**
 * Handles a `FileUploadError` by generating a user-friendly, localized error message.
 * This function is designed to be used within a Formik `handleSubmit` catch block.
 * If the provided error is a `FileUploadError`, it returns an object containing a
 * `heading` and `message` suitable for display. Otherwise, it returns `undefined`.
 *
 * @param error The error object caught during submission.
 * @param t The translation function.
 * @returns An object with `heading` and `message`, or `undefined`.
 */
export const handleUploadError = (
  error: Error,
  t: TFunction
): undefined | { heading: string; message: string } => {
  if (error instanceof FileUploadError && error.file) {
    const heading = t("input-validation.file-upload.default.heading");

    // Detect network errors
    if (typeof window !== "undefined") {
      if (!window.navigator.onLine) {
        return {
          heading: t("input-validation.file-upload.network-error.heading"),
          message: t("input-validation.file-upload.network-error.message"),
        };
      }
    }

    let message = t("input-validation.file-upload.default.message", {
      fileName: error.file.name,
    });

    // Noting this is checked client-side as well
    if (!isIndividualFileSizeValid(error.file.size)) {
      message = t("input-validation.file-upload.file-size-too-large.message", {
        fileName: error.file.name,
      });
    }

    return {
      heading: heading,
      message: message,
    };
  }
};
