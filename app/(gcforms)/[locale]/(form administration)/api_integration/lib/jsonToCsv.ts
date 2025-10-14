import { createArrayCsvStringifier as createCsvStringifier } from "@lib/responses/csv-writer";
import type { FileSystemDirectoryHandle } from "@lib/responses/csv-writer/lib/browser-types";
import { sortByLayout } from "@lib/utils/form-builder";
import { FormElementTypes, type FormElement } from "@lib/types";
import { customTranslate } from "@lib/i18nHelpers";
import type { IGCFormsApiClient } from "./IGCFormsApiClient";
import { parseAnswersField } from "./jsonToCsvHelpers";

import { PublicFormRecord } from "@gcforms/types";

import { mapAnswers } from "@lib/responses/mapper/mapAnswers";

/* eslint-disable no-await-in-loop */
export const processJsonToCsv = async ({
  formId,
  jsonFileNames,
  directoryHandle,
  apiClient,
}: {
  formId: string;
  jsonFileNames: string[];
  // directoryHandle comes from caller state and may be untyped at callsite
  directoryHandle: FileSystemDirectoryHandle | unknown;
  // apiClient may be null at callsite; function will guard
  apiClient: IGCFormsApiClient | null;
}) => {
  if (!directoryHandle || jsonFileNames.length === 0) return;

  // Narrow runtime types
  if (!apiClient) {
    // eslint-disable-next-line no-console
    console.warn("No apiClient provided to processJsonToCsv");
    return;
  }

  if (
    typeof (directoryHandle as unknown as { getFileHandle?: unknown })?.getFileHandle !== "function"
  ) {
    // eslint-disable-next-line no-console
    console.warn("Invalid directoryHandle provided to processJsonToCsv");
    return;
  }

  const dirHandle = directoryHandle as FileSystemDirectoryHandle;

  try {
    // Fetch form template so we can map questions to answers and format appropriately
    const template = await apiClient.getFormTemplate();

    // Assume API returns the form object directly
    const form =
      template && typeof template === "object"
        ? (template as Record<string, unknown>)
        : { elements: [], layout: [] };

    const elements = Array.isArray(form.elements) ? (form.elements as FormElement[]) : [];

    // sort elements according to layout and filter out richText
    const sortedElements = sortByLayout({
      layout: Array.isArray(form.layout) ? (form.layout as number[]) : [],
      elements,
    }).filter((el: FormElement) => ![FormElementTypes.richText].includes(el.type));

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

    const csvStringifier = createCsvStringifier({
      header: headerTitles,
      alwaysQuote: true,
    });

    // Read all JSON files and build structured response records
    const recordsData: string[][] = [];

    for (const fileName of jsonFileNames) {
      try {
        const fileHandle = await dirHandle.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        const content = await file.text();

        const jsonData = JSON.parse(content);

        const answersObj = parseAnswersField(jsonData);
        if (!answersObj) {
          // skip files without answers
          // eslint-disable-next-line no-console
          console.warn(`No answers field found in ${fileName}`);
          continue;
        }

        // mapAnswers expects template.form.elements, but API might return elements directly
        // Wrap in a form object if needed
        const templateForMapping =
          "form" in (template as object)
            ? (template as PublicFormRecord)
            : ({ form: template } as PublicFormRecord);

        const mappedAnswers = mapAnswers({
          template: templateForMapping,
          rawAnswers: answersObj as Record<string, Response>,
        });

        // Build row similar to server-side transform
        const answers = sortedElements.map((element) => {
          const answer = mappedAnswers.find((a) => a.questionId === element.id);
          if (!answer) {
            return "-";
          }
          if (Array.isArray(answer.answer)) {
            // Handle dynamic rows
            return answer.answer
              .map((row) =>
                row
                  .map((subAnswer) => {
                    const text = `${subAnswer.questionEn}\n${subAnswer.questionFr}: ${subAnswer.answer}`;
                    return text || "-";
                  })
                  .join("")
              )
              .join("\n");
          }
          return String(answer.answer || "-");
        });

        const row = [
          (jsonData.id as string) || fileName,
          jsonData.createdAt
            ? new Date(jsonData.createdAt).toISOString()
            : new Date().toISOString(),
          ...answers,
          "Receipt codes are in the Official receipt and record of responses\n" +
            "Les codes de réception sont dans le Reçu et registre officiel des réponses",
        ];

        recordsData.push(row);
      } catch (parseError) {
        // eslint-disable-next-line no-console
        console.error(`Failed to parse ${fileName}:`, parseError);
      }
    }

    if (recordsData.length === 0) {
      // eslint-disable-next-line no-console
      console.warn("No valid answers data found to convert to CSV");
      // return;
    }

    // Create CSV file using csv-writer
    const csvFileName = `${formId}-responses-${Date.now()}.csv`;
    const csvFileHandle = await dirHandle.getFileHandle(csvFileName, { create: true });

    const str = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(recordsData);

    await csvFileHandle.createWritable().then((writer) => {
      writer.write(str);
      writer.close();
    });

    // eslint-disable-next-line no-console
    console.log(`CSV file created: ${csvFileName} with ${recordsData.length} responses`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error processing JSON to CSV:", error);
  }
};
