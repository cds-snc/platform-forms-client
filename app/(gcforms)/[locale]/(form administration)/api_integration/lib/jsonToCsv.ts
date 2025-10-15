import { createArrayCsvStringifier as createCsvStringifier } from "@lib/responses/csv-writer";
import type { FileSystemDirectoryHandle } from "@lib/responses/csv-writer/lib/browser-types";
import { sortByLayout } from "@lib/utils/form-builder";
import { FormElementTypes, type FormElement } from "@lib/types";
import { customTranslate } from "@lib/i18nHelpers";
import { parseAnswersField } from "./jsonToCsvHelpers";

import { mapAnswers } from "@lib/responses/mapper/mapAnswers";
import { type FormProperties } from "@gcforms/types";

const specialChars = ["=", "+", "-", "@"];

/* eslint-disable no-await-in-loop */
export const processJsonToCsv = async ({
  formId,
  jsonFileNames,
  directoryHandle,
  formTemplate,
}: {
  formId: string;
  jsonFileNames: string[];
  // directoryHandle comes from caller state and may be untyped at callsite
  directoryHandle: FileSystemDirectoryHandle | unknown;
  formTemplate: FormProperties;
}) => {
  if (!directoryHandle || jsonFileNames.length === 0) return;

  if (
    typeof (directoryHandle as unknown as { getFileHandle?: unknown })?.getFileHandle !== "function"
  ) {
    // eslint-disable-next-line no-console
    console.warn("Invalid directoryHandle provided to processJsonToCsv");
    return;
  }

  const dirHandle = directoryHandle as FileSystemDirectoryHandle;

  try {
    const elements = Array.isArray(formTemplate.elements)
      ? (formTemplate.elements as FormElement[])
      : [];

    // sort elements according to layout and filter out richText
    const sortedElements = sortByLayout({
      layout: Array.isArray(formTemplate.layout) ? (formTemplate.layout as number[]) : [],
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

        const mappedAnswers = mapAnswers({
          formTemplate,
          rawAnswers: answersObj as Record<string, Response>,
        });

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
