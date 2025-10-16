import { IGCFormsApiClient } from "./IGCFormsApiClient";
import { createArrayCsvStringifier as createCsvStringifier } from "@lib/responses/csv-writer";
import { sortByLayout } from "@lib/utils/form-builder";
import { FormElementTypes, type FormElement } from "@lib/types";
import { customTranslate } from "@lib/i18nHelpers";
import { type FormProperties } from "@gcforms/types";
import { MappedAnswer } from "@lib/responses/mapper/types";
import { FileSystemDirectoryHandle } from "native-file-system-adapter";

const specialChars = ["=", "+", "-", "@"];

export const initCsvHandler = async ({
  apiClient,
  dirHandle,
}: {
  apiClient: IGCFormsApiClient | null;
  dirHandle: FileSystemDirectoryHandle | null;
}) => {
  const formId = apiClient?.getFormId();
  const template = await apiClient?.getFormTemplate();

  if (!formId || !template || !dirHandle) {
    return;
  }

  let csvFileHandle;

  try {
    const csvFileName = `${formId}.csv`;
    // Use try-catch to handle file existence
    try {
      csvFileHandle = await dirHandle.getFileHandle(csvFileName);
      // eslint-disable-next-line no-console
      console.log(`CSV file ${csvFileName} already exists`);
    } catch {
      // File doesn't exist
      csvFileHandle = await dirHandle.getFileHandle(csvFileName, { create: true });

      const sortedElements = orderElements({ formTemplate: template });
      const headers = getHeaders({ sortedElements });

      // Init the file with headers from the template
      const csvStringifier = createCsvStringifier({
        header: headers,
        alwaysQuote: true,
      });

      // Write UTF-8 BOM and headers
      const headerString = "\uFEFF" + csvStringifier.getHeaderString();

      // Write to file
      const writable = await csvFileHandle.createWritable();
      await writable.write(headerString);
      await writable.close();

      // eslint-disable-next-line no-console
      console.log(`Created CSV file ${csvFileName} with headers`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating CSV file:", error);
  }

  return csvFileHandle;
};

export const getCsvHandle = async ({
  apiClient,
  dirHandle,
}: {
  apiClient: IGCFormsApiClient | null;
  dirHandle: FileSystemDirectoryHandle | null;
}) => {
  if (!dirHandle || !apiClient) {
    return null;
  }

  const csvFileHandle = await initCsvHandler({ apiClient, dirHandle });

  return csvFileHandle;
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
