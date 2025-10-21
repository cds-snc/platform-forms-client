import { type FileSystemDirectoryHandle } from "native-file-system-adapter";

import { parseAnswersField } from "./jsonToCsvHelpers";

import { mapAnswers } from "@lib/responses/mapper/mapAnswers";
import { type FormProperties } from "@gcforms/types";
import { getRow, initCsv, orderElements } from "./csvWriter";
import { createArrayCsvWriter } from "@root/lib/responses/csv-writer";

/**
 * Extracts submission IDs from the first column of a CSV file
 * @param csvContent - The CSV file content as a string
 * @returns Array of unique submission IDs
 */
export const getSubmissionIdsFromCsv = async (
  csvFileHandle: FileSystemFileHandle
): Promise<string[]> => {
  const file = await csvFileHandle.getFile();
  const fileContent = await file.text();

  if (!fileContent.trim()) {
    return [];
  }

  const lines = fileContent.split("\n").filter((line) => line.trim() !== "");
  const submissionIds: string[] = [];

  // Skip the header row (index 0) and process data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      // Parse the first column (submission ID) from CSV
      // Handle quoted values that might contain commas
      const match = line.match(/^"([^"]+)"|^([^,]+)/);
      if (match) {
        const submissionId = match[1] || match[2];
        if (submissionId && submissionId.trim()) {
          submissionIds.push(submissionId.trim());
        }
      }
    }
  }

  // Return unique submission IDs
  return [...new Set(submissionIds)];
};

async function getFilenamesInDirectory(directoryHandle: FileSystemDirectoryHandle) {
  const filenames = [];
  for await (const entry of directoryHandle.values()) {
    if (entry.kind === "file" && entry.name.endsWith(".json")) {
      filenames.push(entry.name);
    }
  }
  return filenames;
}

/**
 * Collects response file names from the 'responses' directory, or from the main directory if 'responses' doesn't exist
 * @param directoryHandle - The directory handle to search within
 * @returns Promise<{fileNames: string[], isResponsesDir: boolean}> - Array of JSON file names and whether they're from responses dir
 */
export const collectResponseFiles = async (
  directoryHandle: FileSystemDirectoryHandle
): Promise<{ fileNames: string[]; isResponsesDir: boolean }> => {
  try {
    // Try to get the 'responses' directory handle first
    const responsesHandle = await directoryHandle.getDirectoryHandle("responses");
    const jsonFileNames = await getFilenamesInDirectory(responsesHandle);

    return { fileNames: jsonFileNames, isResponsesDir: true };
  } catch (error) {
    // If responses directory doesn't exist, look in the main directory
    try {
      // Iterate through all files in the main directory
      const jsonFileNames = await getFilenamesInDirectory(directoryHandle);

      return { fileNames: jsonFileNames, isResponsesDir: false };
    } catch (mainError) {
      // eslint-disable-next-line no-console
      console.error("Error reading directory:", mainError);
      return { fileNames: [], isResponsesDir: false };
    }
  }
};

/* eslint-disable no-await-in-loop */
export const jsonFilesToCsv = async ({
  formId,
  directoryHandle,
  formTemplate,
}: {
  formId: string;
  // directoryHandle comes from caller state and may be untyped at callsite
  directoryHandle: FileSystemDirectoryHandle | null;
  formTemplate: FormProperties;
}) => {
  if (!directoryHandle) return;

  try {
    const { fileNames: jsonFileNames, isResponsesDir } =
      await collectResponseFiles(directoryHandle);

    if (jsonFileNames.length === 0) {
      // eslint-disable-next-line no-console
      console.warn(
        `No JSON files found in ${isResponsesDir ? "responses directory" : "directory"}`
      );
      return;
    }

    // Use either the records directory or the main directory based on where files were found
    const sourceHandle = isResponsesDir
      ? await directoryHandle.getDirectoryHandle("records")
      : directoryHandle;
    const sortedElements = orderElements({ formTemplate });

    let recordsAdded = 0;

    // Initialize CSV file as needed in the selected directory
    const csvFileHandle = await initCsv({ formId, dirHandle: directoryHandle, formTemplate });

    if (!csvFileHandle) {
      // eslint-disable-next-line no-console
      console.error("CSV file handle is null, cannot proceed.");
      return;
    }

    const csvWriter = createArrayCsvWriter({
      fileHandle: csvFileHandle as FileSystemFileHandle,
      append: true,
    });

    // read the file, load SubmissionIDs from the first column to avoid duplicates
    const existingSubmissionIds = await getSubmissionIdsFromCsv(
      csvFileHandle as FileSystemFileHandle
    );

    for (const fileName of jsonFileNames) {
      try {
        const fileHandle = await sourceHandle.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        const content = await file.text();
        const jsonData = JSON.parse(content);
        const answersObj = parseAnswersField(jsonData);
        if (!answersObj) {
          // eslint-disable-next-line no-console
          console.warn(`No answers field found in ${fileName}`);
          continue;
        }

        const mappedAnswers = mapAnswers({
          formTemplate,
          rawAnswers: answersObj as Record<string, Response>,
        });

        const row = getRow({
          rowId: String(fileName.replace(".json", "")),
          createdAt: new Date(jsonData.createdAt).toISOString(),
          mappedAnswers,
          sortedElements,
        });

        if (!existingSubmissionIds.includes(row[0])) {
          recordsAdded++;
          await csvWriter.writeRecords([row]);
        }
      } catch (parseError) {
        // eslint-disable-next-line no-console
        console.error(`Failed to parse ${fileName}:`, parseError);
      }
    }

    // eslint-disable-next-line no-console
    console.log(`CSV generation completed. ${recordsAdded} new records added.`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error processing JSON to CSV:", error);
  }
};
