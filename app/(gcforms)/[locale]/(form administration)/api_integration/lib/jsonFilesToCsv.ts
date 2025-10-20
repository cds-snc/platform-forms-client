import { type FileSystemDirectoryHandle } from "native-file-system-adapter";

import { parseAnswersField } from "./jsonToCsvHelpers";

import { mapAnswers } from "@lib/responses/mapper/mapAnswers";
import { type FormProperties } from "@gcforms/types";
import { getFileHandle, getRow, initCsv, orderElements } from "./csvWriter";

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
 * Collects response file names from the 'records' directory, or from the main directory if 'records' doesn't exist
 * @param directoryHandle - The directory handle to search within
 * @returns Promise<{fileNames: string[], isRecordsDir: boolean}> - Array of JSON file names and whether they're from records dir
 */
export const collectResponseFiles = async (
  directoryHandle: FileSystemDirectoryHandle
): Promise<{ fileNames: string[]; isRecordsDir: boolean }> => {
  try {
    // Try to get the 'records' directory handle first
    const recordsHandle = await directoryHandle.getDirectoryHandle("records");
    const jsonFileNames = await getFilenamesInDirectory(recordsHandle);

    return { fileNames: jsonFileNames, isRecordsDir: true };
  } catch (error) {
    // If records directory doesn't exist, look in the main directory
    try {
      // Iterate through all files in the main directory
      const jsonFileNames = await getFilenamesInDirectory(directoryHandle);

      return { fileNames: jsonFileNames, isRecordsDir: false };
    } catch (mainError) {
      // eslint-disable-next-line no-console
      console.error("Error reading directory:", mainError);
      return { fileNames: [], isRecordsDir: false };
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
    const { fileNames: jsonFileNames, isRecordsDir } = await collectResponseFiles(directoryHandle);

    if (jsonFileNames.length === 0) {
      // eslint-disable-next-line no-console
      console.warn(`No JSON files found in ${isRecordsDir ? "records directory" : "directory"}`);
      return;
    }

    // Use either the records directory or the main directory based on where files were found
    const sourceHandle = isRecordsDir
      ? await directoryHandle.getDirectoryHandle("records")
      : directoryHandle;
    const sortedElements = orderElements({ formTemplate });

    const recordsData: string[][] = [];

    // Initialize CSV file as needed in the selected directory
    const csvStringifier = await initCsv({ formId, dirHandle: directoryHandle, formTemplate });

    if (!csvStringifier) {
      // eslint-disable-next-line no-console
      console.error("Failed to initialize CSV stringifier");
      return;
    }

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

        recordsData.push(row);
      } catch (parseError) {
        // eslint-disable-next-line no-console
        console.error(`Failed to parse ${fileName}:`, parseError);
      }
    }

    const { handle } = await getFileHandle({ formId, dirHandle: directoryHandle });

    if (!handle) {
      // eslint-disable-next-line no-console
      console.error("Failed to get CSV file handle");
      return;
    }

    const rowsString = csvStringifier.stringifyRecords(recordsData);

    const writable = await handle.createWritable({ keepExistingData: true });
    // Seek to end of file
    const file = await handle.getFile();
    await writable.seek(file.size);
    await writable.write(rowsString);
    await writable.close();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error processing JSON to CSV:", error);
  }
};
