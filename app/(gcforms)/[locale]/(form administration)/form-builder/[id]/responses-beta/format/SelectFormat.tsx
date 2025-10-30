"use client";

import { Button } from "@clientComponents/globals";
import { useResponsesContext } from "../context/ResponsesContext";
import { Checkbox } from "../../../components/shared/MultipleChoice";

export const SelectFormat = ({ locale, id }: { locale: string; id: string }) => {
  const { onCancel, setSelectedFormat, retrieveResponses, processResponses } =
    useResponsesContext();

  const handleNext = async () => {
    const initialResponses = await retrieveResponses();

    processResponses(initialResponses);

    id;
    locale;
    // Navigate to the next step
  };

  return (
    <div>
      <div>Step 3 of 3</div>
      <h1>Optional response format</h1>
      <div>
        <p>
          <strong>Select to download HTML individual responses.</strong>
        </p>
        <p>All downloads will come with a CSV and raw JSON response files.</p>
        <div className="form-builder my-6">
          <Checkbox
            name="format"
            id="format-csv"
            label="Combined in a spreadsheet (Aggregated CSV file)"
            onChange={() => setSelectedFormat("csv")}
          />
          <Checkbox
            name="format"
            id="format-html"
            label="Individual copies (Separate HTML files)"
            onChange={() => setSelectedFormat("html")}
          />
        </div>
      </div>
      <div className="flex flex-row gap-4">
        <Button theme="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button theme="primary" onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
};
