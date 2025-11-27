import { FileSystemDirectoryHandle, FileSystemFileHandle } from "native-file-system-adapter";

import { type Response, type FormProperties } from "@gcforms/types";
import { FormElementTypes, type FormElement } from "@lib/types";

import { createArrayCsvStringifier as createCsvStringifier } from "@lib/responses/csv-writer";
import { sortByLayout } from "@lib/utils/form-builder";
import { customTranslate } from "@lib/i18nHelpers";
import { MappedAnswer } from "@lib/responses/mapper/types";
import { mapAnswers } from "@lib/responses/mapper/mapAnswers";
import { ResponseFilenameMapping } from "./processResponse";

const specialChars = ["=", "+", "-", "@"];

export const initCsv = async ({
  formId,
  dirHandle,
  formTemplate,
}: {
  formId: string;
  dirHandle: FileSystemDirectoryHandle;
  formTemplate: FormProperties;
}) => {
  const { handle, created } = await getFileHandle({ formId, dirHandle });

  if (!created) {
    // File already exists, no need to initialize
    return { handle, created };
  }

  const sortedElements = orderElements({ formTemplate });
  const headers = getHeaders({ sortedElements });

  // Init the file with headers from the template
  const csvStringifier = createCsvStringifier({
    header: headers,
    alwaysQuote: true,
  });

  // Write UTF-8 BOM and headers
  const headerString = "\uFEFF" + csvStringifier.getHeaderString();

  // Write to file
  const writable = await (await handle)?.createWritable();
  await writable?.write(headerString);
  await writable?.close();

  return { handle, created };
};

export const getFileHandle = async ({
  formId,
  dirHandle,
}: {
  formId: string;
  dirHandle: FileSystemDirectoryHandle | null;
}): Promise<{ handle: FileSystemFileHandle | null; created: boolean }> => {
  if (!dirHandle || !formId) {
    return { handle: null, created: false };
  }

  let csvFileHandle = null;
  let created: boolean = false;

  try {
    const csvFileName = `${formId}.csv`;
    // Use try-catch to handle file existence
    try {
      csvFileHandle = await dirHandle.getFileHandle(csvFileName);
    } catch {
      // File doesn't exist
      csvFileHandle = await dirHandle.getFileHandle(csvFileName, { create: true });
      created = true;
      // eslint-disable-next-line no-console
      console.log(`CSV file ${csvFileName} created`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating CSV file:", error);
  }

  return { handle: csvFileHandle, created };
};

export const writeRow = async ({
  submissionId,
  createdAt,
  formTemplate,
  csvFileHandle,
  rawAnswers,
  attachments,
}: {
  submissionId: string;
  createdAt: string;
  formTemplate: FormProperties;
  csvFileHandle: FileSystemFileHandle;
  rawAnswers: Record<string, Response>;
  attachments: ResponseFilenameMapping;
}) => {
  const sortedElements = orderElements({ formTemplate });

  const mappedAnswers = mapAnswers({
    formTemplate,
    rawAnswers,
    attachments,
  });

  const row = getRow({
    rowId: submissionId,
    createdAt: new Date(createdAt).toISOString(),
    mappedAnswers,
    sortedElements,
  });

  const recordsData = [row];

  const csvStringifier = createCsvStringifier({
    header: getHeaders({ sortedElements }),
    alwaysQuote: true,
  });

  const rowString = csvStringifier.stringifyRecords(recordsData);

  // Write to file with error handling
  if (csvFileHandle) {
    let writable;
    try {
      writable = await csvFileHandle.createWritable({ keepExistingData: true });

      // Seek to end of file
      const file = await csvFileHandle.getFile();
      await writable.seek(file.size);
      await writable.write(rowString);
      await writable.close();
    } catch (error) {
      // Clean up writable if it was created
      if (writable) {
        try {
          await writable.abort();
        } catch {
          // Ignore abort errors
        }
      }

      // Handle specific DOMException errors - throw with cause to preserve original error
      if (error instanceof DOMException) {
        if (error.name === "NoModificationAllowedError") {
          throw new Error(
            `Cannot modify file "${csvFileHandle.name}" posssibly opened in another program.`,
            { cause: error }
          );
        } else if (error.name === "InvalidStateError") {
          throw new Error(
            `The file "${csvFileHandle.name}" is in an invalid state. It may be locked or corrupted.`,
            { cause: error }
          );
        } else if (error.name === "QuotaExceededError") {
          throw new Error(
            `Not enough storage space available to write to the file "${csvFileHandle.name}".`,
            {
              cause: error,
            }
          );
        }
      }

      // Re-throw if not a known error
      throw error;
    }
  }
};

export const orderElements = ({ formTemplate }: { formTemplate: FormProperties }) => {
  const elements = Array.isArray(formTemplate.elements)
    ? (formTemplate.elements as FormElement[])
    : [];

  // sort elements according to layout and filter out richText
  const sortedElements = sortByLayout({
    layout: Array.isArray(formTemplate.layout) ? (formTemplate.layout as number[]) : [],
    elements,
  }).filter((el: FormElement) => ![FormElementTypes.richText].includes(el.type));

  return sortedElements;
};

export const getHeaders = ({ sortedElements }: { sortedElements: FormElement[] }) => {
  const { t } = customTranslate("common");

  // Build headers in the same style as server-side transform (titles with EN/FR and date format)
  const headerTitles = sortedElements.map((element: FormElement) => {
    return `${element.properties.titleEn}\n${element.properties.titleFr}${
      element.type === FormElementTypes.formattedDate && element.properties.dateFormat
        ? "\n" +
          t(`formattedDate.${element.properties.dateFormat}`, { lng: "en" }) +
          "/" +
          t(`formattedDate.${element.properties.dateFormat}`, { lng: "fr" })
        : ""
    }`;
  });

  // prepend submission id and date headers and append receipt text similar to transform
  headerTitles.unshift("Submission ID \nIdentifiant de soumission");
  headerTitles.splice(1, 0, "Date of submission \nDate de soumission");

  return headerTitles;
};

export const getRow = ({
  rowId,
  createdAt,
  mappedAnswers,
  sortedElements,
}: {
  rowId: string;
  createdAt: string;
  mappedAnswers: MappedAnswer[];
  sortedElements: FormElement[];
}) => {
  // Build row similar to server-side transform
  const answers = sortedElements.map((element) => {
    const mappedAnswer = mappedAnswers.find((a) => a.questionId === element.id);

    if (!mappedAnswer) {
      return "-";
    }

    if (mappedAnswer.answer instanceof Array) {
      return mappedAnswer.answer
        .map((answer) =>
          answer
            .map((subAnswer) => {
              let answerText =
                `${subAnswer.questionEn}\n${subAnswer.questionFr}: ${subAnswer.answer}\n` || "";

              if (
                typeof answerText === "string" &&
                specialChars.some((char) => answerText.startsWith(char))
              ) {
                answerText = `'${answerText}`;
              }
              if (answerText == "") {
                answerText = "-";
              }
              return answerText;
            })
            .join("")
        )
        .join("\n");
    }
    let answerText = mappedAnswer.answer || "";
    if (
      typeof answerText === "string" &&
      specialChars.some((char) => answerText.startsWith(char))
    ) {
      answerText = `'${answerText}`;
    }
    if (answerText == "") {
      answerText = "-";
    }
    return answerText;
  });

  const row = [rowId, createdAt, ...answers];

  return row;
};
