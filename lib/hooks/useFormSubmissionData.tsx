"use client";

import { type FormValues } from "@lib/formContext";
import { type Language } from "@lib/types/form-builder-types";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { getReviewItems } from "@clientComponents/forms/Review/helpers";
import { useCallback } from "react";
import { slugify } from "@lib/client/clientHelpers";
import { getStartLabels } from "@lib/utils/form-builder/i18nHelpers";
import { type HTMLProps } from "@lib/saveAndResume/types";

export const useFormSubmissionData = ({
  language,
  type,
}: {
  language: Language;
  type: "confirm" | "progress";
}) => {
  const {
    groups,
    getValues,
    formRecord,
    getGroupHistory,
    getProgressData,
    submissionId,
    submissionDate,
  } = useGCFormsContext();

  const formValues: void | FormValues = getValues();
  const groupHistoryIds = getGroupHistory();
  if (!formValues || !groups) throw new Error("Form values or groups are missing");

  // Clean up the values for use with the Review component (removing the file contents)
  const cleanedValues = {} as unknown as FormValues;

  Object.entries(formValues).map(([key, value]) => {
    let cleanedValue = value;

    // For file inputs we just want to keep the name and size, and reset the base64 encoded file
    if (value && typeof value === "object" && "size" in value && "name" in value) {
      // Just keep the name
      cleanedValue = {
        name: value.name as string,
        size: value.size as number,
        based64EncodedFile: null,
      } as unknown as string; // force compatibility with existing types
    }

    // For all other inputs just return the value
    cleanedValues[key] = cleanedValue;
  });

  const reviewItems = getReviewItems({
    formRecord: formRecord,
    formValues: cleanedValues as unknown as FormValues,
    groups,
    groupHistoryIds,
    language,
  });

  const title = language === "en" ? formRecord.form.titleEn : formRecord.form.titleFr;
  const formId = formRecord.id;
  const fileName = `${slugify(title)}-${formId}.html`;

  const getOptions = useCallback(() => {
    const options: HTMLProps = {
      formTitle: title,
      type,
      formId: String(formId),
      reviewItems,
      formResponse: Buffer.from(JSON.stringify(getProgressData()), "utf8").toString("base64"),
      language,
      startSectionTitle: getStartLabels()[language],
      submissionId,
      submissionDate,
    };

    return options;
  }, [title, getProgressData, type, formId, reviewItems, language, submissionId, submissionDate]);

  return { fileName, reviewItems, submissionId, submissionDate, getOptions };
};
