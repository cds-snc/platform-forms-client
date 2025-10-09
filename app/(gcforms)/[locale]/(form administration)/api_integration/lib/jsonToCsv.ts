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
    // Read all JSON files and parse them
    const allData: Record<string, unknown>[] = [];

    for (const fileName of jsonFileNames) {
      try {
        const fileHandle = await directoryHandle.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        const content = await file.text();

        const jsonData = JSON.parse(content);
        // Handle both single objects and arrays
        if (Array.isArray(jsonData)) {
          allData.push(...jsonData);
        } else {
          allData.push(jsonData);
        }
      } catch (parseError) {
        // eslint-disable-next-line no-console
        console.error(`Failed to parse ${fileName}:`, parseError);
      }
    }

    if (allData.length === 0) {
      // eslint-disable-next-line no-console
      console.warn("No valid JSON data found to convert to CSV");
      return;
    }

    // Get all unique keys to create header
    const allKeys = new Set<string>();
    allData.forEach((item) => {
      Object.keys(item).forEach((key) => allKeys.add(key));
    });

    const headers = Array.from(allKeys).map((key) => ({ id: key, title: key }));

    // Create CSV file using csv-writer
    const csvFileName = `${formId}-responses-${Date.now()}.csv`;
    const csvFileHandle = await directoryHandle.getFileHandle(csvFileName, { create: true });

    const csvWriter = createObjectCsvWriter({
      fileHandle: csvFileHandle as FileSystemFileHandle,
      header: headers,
    });

    // Convert data to proper CSV field types (JSON values are serializable and compatible with Field type)
    const csvData = allData.map((item) => {
      const csvRecord: Record<string, string | number | boolean | null | undefined> = {};
      Object.entries(item).forEach(([key, value]) => {
        // Convert unknown values to Field types - JSON values are already serializable
        if (
          value === null ||
          value === undefined ||
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          csvRecord[key] = value;
        } else {
          // For complex objects/arrays, convert to string representation
          csvRecord[key] = String(value);
        }
      });
      return csvRecord;
    });

    await csvWriter.writeRecords(csvData);

    // eslint-disable-next-line no-console
    console.log(`CSV file created: ${csvFileName}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error processing JSON to CSV:", error);
  }
};
