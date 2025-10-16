import { createArrayCsvStringifier as createCsvStringifier } from "@lib/responses/csv-writer";
import { sortByLayout } from "@lib/utils/form-builder";
import { FormElementTypes, type FormElement } from "@lib/types";
import { customTranslate } from "@lib/i18nHelpers";
import { type FormProperties } from "@gcforms/types";
import { MappedAnswer } from "@lib/responses/mapper/types";
import { FileSystemDirectoryHandle, FileSystemFileHandle } from "native-file-system-adapter";
import { mapAnswers } from "@root/lib/responses/mapper/mapAnswers";

const specialChars = ["=", "+", "-", "@"];

export const initCsv = async ({
  formId,
  dirHandle,
  formTemplate,
}: {
  formId: string | undefined;
  dirHandle: FileSystemDirectoryHandle | null;
  formTemplate: FormProperties | undefined;
}) => {
  if (!formId || !formTemplate || !dirHandle) {
    return;
  }

  const { handle, created } = await getFileHandle({ formId, dirHandle });

  if (!created) {
    // File already exists, no need to initialize
    return;
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
};

export const writeSubmissionsToCsv = async ({
  formId,
  dirHandle,
  formTemplate,
  submissionData,
}: {
  formId: string;
  dirHandle: FileSystemDirectoryHandle;
  formTemplate: FormProperties;
  submissionData: Array<{
    submissionId: string;
    createdAt: string;
    rawAnswers: Record<string, Response>;
  }>;
}) => {
  if (!submissionData || submissionData.length === 0) {
    return;
  }

  // Write rows sequentially to maintain order
  for (const submission of submissionData) {
    // eslint-disable-next-line no-await-in-loop
    await writeRow({
      formId,
      submissionId: submission.submissionId,
      createdAt: submission.createdAt,
      formTemplate,
      dirHandle,
      rawAnswers: submission.rawAnswers,
    });
  }
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
  formId,
  submissionId,
  createdAt,
  formTemplate,
  dirHandle,
  rawAnswers,
}: {
  formId: string;
  submissionId: string;
  createdAt: string;
  formTemplate: FormProperties;
  dirHandle: FileSystemDirectoryHandle | null;
  rawAnswers: Record<string, Response>;
}) => {
  const { handle } = await getFileHandle({ formId, dirHandle });

  // Check if submission already exists in CSV
  const fileHandle = handle;
  if (fileHandle) {
    const file = await fileHandle.getFile();
    const fileContent = await file.text();

    // Check if submissionId already exists in the file
    if (fileContent.includes(submissionId)) {
      // console.log(`Submission ${submissionId} already exists in CSV, skipping...`);
      return;
    }
  }

  const sortedElements = orderElements({ formTemplate });

  const mappedAnswers = mapAnswers({
    formTemplate,
    rawAnswers,
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

  // Write to file
  if (fileHandle) {
    const writable = await fileHandle.createWritable({ keepExistingData: true });
    // Seek to end of file
    const file = await fileHandle.getFile();
    await writable.seek(file.size);
    await writable.write(rowString);
    await writable.close();
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
  headerTitles.push("Receipt codes \nCodes de réception");

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
              let answerText = `${subAnswer.questionEn}\n${subAnswer.questionFr}: ${subAnswer.answer}\n`;
              if (specialChars.some((char) => answerText.startsWith(char))) {
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
    let answerText = mappedAnswer.answer;
    if (specialChars.some((char) => answerText.startsWith(char))) {
      answerText = `'${answerText}`;
    }
    if (answerText == "") {
      answerText = "-";
    }
    return answerText;
  });

  const row = [
    rowId,
    createdAt,
    ...answers,
    "Receipt codes are in the Official receipt and record of responses\n" +
      "Les codes de réception sont dans le Reçu et registre officiel des réponses",
  ];

  return row;
};
