import { useMemo } from "react";
import { fileExtractor } from "@lib/fileExtractor";
import { type FormValues } from "@lib/formContext";
import { useTranslation } from "@i18n/client";

export const SaveFileWarning = ({
  formValues,
  type,
}: {
  formValues: void | FormValues;
  type: "confirm" | "progress";
}) => {
  const { t } = useTranslation("common");

  const hasFiles = useMemo(() => {
    if (!open || !formValues) return false;
    const { files } = fileExtractor(formValues);
    return files.length > 0;
  }, [formValues]);

  if (!hasFiles) return null;

  return (
    <p className="mb-4">
      {type === "confirm" ? t("confirmFileWarning.text") : t("saveFileWarning.text")}
    </p>
  );
};
