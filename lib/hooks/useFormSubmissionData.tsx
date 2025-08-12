"use client";

import { type FormValues } from "@lib/formContext";
import { type Language } from "@lib/types/form-builder-types";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { getReviewItems } from "@clientComponents/forms/Review/helpers";
import { useCallback } from "react";
import { slugify } from "@lib/client/clientHelpers";
import { getStartLabels } from "@lib/utils/form-builder/i18nHelpers";
import { type HTMLProps } from "@lib/saveAndResume/types";
import { copyObjectExcludingFileContent } from "@root/app/(gcforms)/[locale]/(form filler)/id/[...props]/lib/client/fileUploader";

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
  const { formValuesWithoutFileContent } = copyObjectExcludingFileContent(formValues);

  const reviewItems = getReviewItems({
    formRecord: formRecord,
    formValues: formValuesWithoutFileContent as FormValues,
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
