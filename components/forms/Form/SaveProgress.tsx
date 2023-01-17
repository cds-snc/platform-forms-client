import React from "react";
import { useProgress } from "@components/form-builder/hooks";
import { Responses } from "@lib/types";

export const SaveProgress = ({ values }: { values: Responses }) => {
  const { importProgress, saveProgress } = useProgress();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target || !e.target.files) {
      return;
    }

    const target = e.target;

    try {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        if (!e.target || !e.target.result || typeof e.target.result !== "string") return;
        let data;

        try {
          data = JSON.parse(e.target.result);
        } catch (e) {
          if (e instanceof SyntaxError) {
            // setErrors([{ message: t("startErrorParse") }]);
            target.value = "";
            return;
          }
        }
        importProgress(data);
      };
    } catch (e) {
      if (e instanceof Error) {
        // setErrors([{ message: e.message }]);
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          saveProgress(values);
        }}
      >
        Save progress
      </button>
      <input id="file-upload" type="file" onChange={handleChange} />
    </>
  );
};
