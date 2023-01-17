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
    <span className="flex flex-row mt-8">
      <div className="">
        <button
          type="button"
          className="border border-gray-400 rounded-md px-4 py-2 hover:bg-gray-200"
          onClick={(e) => {
            e.preventDefault();
            saveProgress(values);
          }}
        >
          Save progress
        </button>
      </div>
      <div className="ml-4">
        <label className="block border border-gray-400 rounded-md p-1.5">
          <span className="sr-only">Upload progress file</span>
          <input
            onChange={handleChange}
            type="file"
            className="block w-full text-sm text-slate-500 
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm
              file:bg-gray-300 file:text-gray-900
              hover:file:bg-gray-100"
          />
        </label>
      </div>
    </span>
  );
};
