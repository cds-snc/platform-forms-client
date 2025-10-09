import { createObjectCsvWriter } from "./csv-writer";
import type {
  FileSystemFileHandle,
  FileSystemDirectoryHandle,
} from "./csv-writer/lib/browser-types";

/* eslint-disable no-await-in-loop */
export const processJsonToCsv = async ({
  formId,
  jsonFileNames,
  directoryHandle,
}: {
  formId: string;
  jsonFileNames: string[];
  directoryHandle: FileSystemDirectoryHandle;
}) => {
  if (!directoryHandle || jsonFileNames.length === 0) return;

  try {
    // Read all JSON files and extract answers
    const allAnswers: Record<string, unknown>[] = [];

    for (const fileName of jsonFileNames) {
      try {
        const fileHandle = await directoryHandle.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        const content = await file.text();

        const jsonData = JSON.parse(content);

        // Extract answers field - it's a JSON string that needs to be parsed
        if (jsonData.answers && typeof jsonData.answers === "string") {
          try {
            const answersData = JSON.parse(jsonData.answers);
            allAnswers.push(answersData);
          } catch (answersParseError) {
            // eslint-disable-next-line no-console
            console.error(`Failed to parse answers from ${fileName}:`, answersParseError);
          }
        } else if (jsonData.answers && typeof jsonData.answers === "object") {
          // If answers is already an object, use it directly
          allAnswers.push(jsonData.answers);
        } else {
          // eslint-disable-next-line no-console
          console.warn(`No answers field found in ${fileName}`);
        }
      } catch (parseError) {
        // eslint-disable-next-line no-console
        console.error(`Failed to parse ${fileName}:`, parseError);
      }
    }

    if (allAnswers.length === 0) {
      // eslint-disable-next-line no-console
      console.warn("No valid answers data found to convert to CSV");
      return;
    }

    // Get all unique question IDs to create header
    const allQuestionIds = new Set<string>();
    allAnswers.forEach((answers) => {
      Object.keys(answers).forEach((questionId) => allQuestionIds.add(questionId));
    });

    const headers = Array.from(allQuestionIds).map((questionId) => ({
      id: questionId,
      title: `Question ${questionId}`,
    }));

    // Create CSV file using csv-writer
    const csvFileName = `${formId}-responses-${Date.now()}.csv`;
    const csvFileHandle = await directoryHandle.getFileHandle(csvFileName, { create: true });

    const csvWriter = createObjectCsvWriter({
      fileHandle: csvFileHandle as FileSystemFileHandle,
      header: headers,
    });

    // Convert answers data to proper CSV field types
    const csvData = allAnswers.map((answers) => {
      const csvRecord: Record<string, string | number | boolean | null | undefined> = {};
      Object.entries(answers).forEach(([questionId, answer]) => {
        // Convert unknown values to Field types - JSON values are already serializable
        if (
          answer === null ||
          answer === undefined ||
          typeof answer === "string" ||
          typeof answer === "number" ||
          typeof answer === "boolean"
        ) {
          csvRecord[questionId] = answer;
        } else {
          // For complex objects/arrays, convert to string representation
          csvRecord[questionId] = String(answer);
        }
      });
      return csvRecord;
    });

    await csvWriter.writeRecords(csvData);

    // eslint-disable-next-line no-console
    console.log(`CSV file created: ${csvFileName} with ${allAnswers.length} responses`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error processing JSON to CSV:", error);
  }
};
