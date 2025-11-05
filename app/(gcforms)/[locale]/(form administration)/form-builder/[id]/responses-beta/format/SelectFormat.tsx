"use client";

import { Button } from "@clientComponents/globals";
import { useResponsesContext } from "../context/ResponsesContext";
import { Radio } from "../../../components/shared/MultipleChoice";
import { useRouter } from "next/navigation";
import { useTranslation } from "@root/i18n/client";
import { useCallback } from "react";

export const SelectFormat = ({ locale, id }: { locale: string; id: string }) => {
  const { t } = useTranslation("response-api");

  const { setSelectedFormat, selectedFormat, retrieveResponses, processResponses } =
    useResponsesContext();

  const router = useRouter();

  const handleBack = () => {
    //
  };

  const handleNext = useCallback(async () => {
    const initialResponses = await retrieveResponses();

    processResponses(initialResponses);

    router.push(`/${locale}/form-builder/${id}/responses-beta/processing`);
  }, [retrieveResponses, processResponses, router, locale, id]);

  const handleFormatChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const value = evt.target.value;
      setSelectedFormat(value);
    },
    [setSelectedFormat]
  );

  return (
    <div>
      <div className="mb-4">{t("stepOf", { current: 3, total: 3 })}</div>
      <h1>Optional response format</h1>
      <div>
        <p>
          <strong>Select to download HTML individual responses.</strong>
        </p>
        <p>All downloads will come with a CSV and raw JSON response files.</p>
        <div className="form-builder my-6">
          <Radio
            name="format"
            id="format-csv"
            value="csv"
            label="Combined in a spreadsheet (Aggregated CSV file)"
            onChange={handleFormatChange}
          />
          <Radio
            name="format"
            id="format-html"
            value="html"
            label="Individual copies (Separate HTML files)"
            onChange={handleFormatChange}
          />
        </div>
      </div>
      <div className="flex flex-row gap-4">
        <Button theme="secondary" onClick={handleBack}>
          Back
        </Button>
        <Button theme="primary" disabled={!selectedFormat} onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
};
