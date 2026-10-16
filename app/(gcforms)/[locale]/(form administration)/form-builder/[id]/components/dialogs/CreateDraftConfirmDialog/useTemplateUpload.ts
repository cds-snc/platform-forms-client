"use client";

import { useCallback, useRef, useState } from "react";
import { FormProperties } from "@lib/types";
import { safeJSONParse } from "@lib/utils";
import { errorMessage, validateTemplate } from "@lib/utils/form-builder/validate";
import { validateTemplateSize } from "@lib/utils/validateTemplateSize";
import { transformFormProperties } from "@lib/store/helpers/elements/transformFormProperties";
import { migrateTemplate } from "@lib/templates/schemaVersioning/migrateTemplate";
import { BetaComponentsError, checkForBetaComponents } from "@lib/validation/betaCheck";

export const useTemplateUpload = (getFlag: (key: string) => boolean) => {
  const uploadInput = useRef<HTMLInputElement>(null);
  const [uploadedConfig, setUploadedConfig] = useState<FormProperties>();
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadErrors, setUploadErrors] = useState<errorMessage[]>([]);

  const resetUpload = useCallback(() => {
    setUploadedConfig(undefined);
    setUploadedFileName("");
    setUploadErrors([]);
    if (uploadInput.current) uploadInput.current.value = "";
  }, []);

  const clearUploadErrors = useCallback(() => {
    setUploadErrors([]);
  }, []);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadErrors([]);
    setUploadedConfig(undefined);
    setUploadedFileName("");

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result;
      if (typeof result !== "string") return;

      if (!validateTemplateSize(result)) {
        setUploadErrors([{ message: "startErrorTemplateSize" }]);
        event.target.value = "";
        return;
      }

      const parsed = safeJSONParse<FormProperties>(result, (key, value) =>
        ["__proto__", "constructor"].includes(key) ? undefined : value
      );
      if (!parsed) {
        setUploadErrors([{ message: "startErrorParse" }]);
        event.target.value = "";
        return;
      }

      try {
        const sourceValidation = validateTemplate(parsed);
        const normalized = migrateTemplate(transformFormProperties(parsed));
        const validation = validateTemplate(normalized);
        if (!validation.valid) {
          setUploadErrors(validation.errors);
          event.target.value = "";
          return;
        }

        checkForBetaComponents(normalized.elements, getFlag);
        setUploadedConfig(normalized);
        setUploadedFileName(file.name);
        if (!sourceValidation.valid) {
          setUploadErrors([]);
        }
      } catch (error) {
        if (error instanceof BetaComponentsError) {
          setUploadErrors([{ message: "beta.loadingError" }]);
        } else {
          setUploadErrors([{ message: "startErrorParse" }]);
        }
        event.target.value = "";
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  return {
    uploadInput,
    uploadedConfig,
    uploadedFileName,
    uploadErrors,
    handleUpload,
    resetUpload,
    clearUploadErrors,
  };
};
