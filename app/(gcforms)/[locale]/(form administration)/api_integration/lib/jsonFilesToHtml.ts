import { type FileSystemDirectoryHandle } from "native-file-system-adapter";

import { parseAnswersField } from "./jsonToCsvHelpers";

import { mapAnswers } from "@lib/responses/mapper/mapAnswers";
import { SecurityAttribute, type FormProperties } from "@gcforms/types";
import { ResponseHtml } from "@root/lib/responseDownloadFormats/html/components/ResponseHtml";
import { Answer } from "@root/lib/responseDownloadFormats/types";
import { TFunction } from "i18next";

/**
 * Extracts submission IDs from the first column of a CSV file
 * @param csvContent - The CSV file content as a string
 * @returns Array of unique submission IDs
 */
export const getSubmissionIdsFromHtmlDirectory = async (
  htmlDirectoryHandle: FileSystemDirectoryHandle
): Promise<string[]> => {
  const submissionIds: string[] = [];
  for await (const entry of htmlDirectoryHandle.values()) {
    if (entry.kind === "file" && entry.name.endsWith(".html")) {
      const submissionId = entry.name.replace(".html", "");
      submissionIds.push(submissionId);
    }
  }

  // Return unique submission IDs
  return [...new Set(submissionIds)];
};

async function getResponseFilenamesInDirectory(directoryHandle: FileSystemDirectoryHandle) {
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
    const jsonFileNames = await getResponseFilenamesInDirectory(responsesHandle);

    return { fileNames: jsonFileNames, isResponsesDir: true };
  } catch (error) {
    // If responses directory doesn't exist, look in the main directory
    try {
      // Iterate through all files in the main directory
      const jsonFileNames = await getResponseFilenamesInDirectory(directoryHandle);

      return { fileNames: jsonFileNames, isResponsesDir: false };
    } catch (mainError) {
      // eslint-disable-next-line no-console
      console.error("Error reading directory:", mainError);
      return { fileNames: [], isResponsesDir: false };
    }
  }
};

/* eslint-disable no-await-in-loop */
export const jsonFilesToHtml = async ({
  formId,
  directoryHandle,
  formTemplate,
  t,
}: {
  formId: string;
  // directoryHandle comes from caller state and may be untyped at callsite
  directoryHandle: FileSystemDirectoryHandle | null;
  formTemplate: FormProperties;
  t: TFunction<string | string[], undefined>;
}) => {
  if (!directoryHandle) return;

  const renderToStaticMarkup = (await import("react-dom/server")).renderToStaticMarkup;

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

    let recordsAdded = 0;

    // read the file, load SubmissionIDs from the first column to avoid duplicates
    const existingSubmissionIds = await getSubmissionIdsFromHtmlDirectory(directoryHandle);

    for (const fileName of jsonFileNames) {
      // Skip files that are already processed
      if (existingSubmissionIds.includes(fileName.replace(".json", ""))) {
        continue;
      }

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

        const submission = {
          id: fileName.replace(".json", ""),
          createdAt: jsonData.createdAt,
          confirmationCode: "",
          answers: mappedAnswers as Answer[],
        };

        // Ensure securityAttribute is of type SecurityAttribute
        const securityAttribute: SecurityAttribute =
          typeof formTemplate.securityAttribute === "string"
            ? (formTemplate.securityAttribute as SecurityAttribute)
            : "Unclassified";

        const formRecord = {
          id: formId,
          name: String(formTemplate.name ?? ""),
          form: formTemplate,
          isPublished: Boolean(formTemplate.isPublished),
          securityAttribute,
        };

        const html = renderToStaticMarkup(
          ResponseHtml({
            response: submission,
            formRecord,
            confirmationCode: "",
            responseID: submission.id,
            createdAt: submission.createdAt,
            securityAttribute: "Unclassified",
            t,
          })
        );

        // Write HTML to a file named with the submissionId and .html extension

        const htmlFileHandle = await directoryHandle.getFileHandle(`${submission.id}.html`, {
          create: true,
        });
        const writable = await htmlFileHandle.createWritable();
        await writable.write(html);
        await writable.close();

        recordsAdded++;
      } catch (parseError) {
        // eslint-disable-next-line no-console
        console.error(`Failed to parse ${fileName}:`, parseError);
      }
    }

    return `HTML generation completed. ${recordsAdded} new records added.`;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error processing JSON to HTML:", error);
    return `Error processing JSON to HTML: ${error}`;
  }
};
