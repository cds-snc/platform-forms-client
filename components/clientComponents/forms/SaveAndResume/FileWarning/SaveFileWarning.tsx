import { useMemo } from "react";
import { fileExtractor } from "@lib/fileExtractor";
import { type FormValues } from "@lib/formContext";
import { useTranslation } from "@i18n/client";

import { Alert } from "@clientComponents/globals";

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
    <Alert.Warning className="mb-4">
      <Alert.Body>
        <span className="text-slate-950">
          {" "}
          {type === "confirm" ? t("confirmFileWarning.text") : t("saveFileWarning.text")}{" "}
        </span>
      </Alert.Body>
    </Alert.Warning>
  );
};
