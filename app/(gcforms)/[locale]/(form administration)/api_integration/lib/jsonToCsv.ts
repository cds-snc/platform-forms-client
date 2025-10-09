import { createObjectCsvWriter } from "./csv-writer";
import type {
  FileSystemFileHandle,
  FileSystemDirectoryHandle,
} from "./csv-writer/lib/browser-types";
import { sortByLayout } from "@lib/utils/form-builder";
import { FormElementTypes, type FormElement } from "@lib/types";
import { customTranslate } from "@lib/i18nHelpers";
import type { IGCFormsApiClient } from "./IGCFormsApiClient";
import type { Field } from "./csv-writer/lib/record";
import {
  parseAnswersField,
  formatAnswer as helperFormatAnswer,
  renderDynamicRow,
} from "./jsonToCsvHelpers";

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
    const headers = sortedElements.map((element: FormElement) => {
      const title = `${element.properties.titleEn}\n${element.properties.titleFr}${
        element.type === FormElementTypes.formattedDate && element.properties.dateFormat
          ? "\n" +
            t(`formattedDate.${element.properties.dateFormat}`, { lng: "en" }) +
            "/" +
            t(`formattedDate.${element.properties.dateFormat}`, { lng: "fr" })
          : ""
      }`;
      return { id: String(element.id), title };
    });

    // prepend submission id and date headers and append receipt text similar to transform
    headers.unshift({ id: "__submissionId", title: "Submission ID \nIdentifiant de soumission" });
    headers.splice(1, 0, { id: "__createdAt", title: "Date of submission \nDate de soumission" });
    headers.push({ id: "__receipt", title: "Receipt codes \nCodes de réception" });

    // Read all JSON files and build structured response records
    const recordsData: Record<string, unknown>[] = [];

    for (const fileName of jsonFileNames) {
      try {
        const fileHandle = await dirHandle.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        const content = await file.text();

        const jsonData = JSON.parse(content);

        const answersObj = parseAnswersField(jsonData as Record<string, unknown>);
        if (!answersObj) {
          // skip files without answers
          // eslint-disable-next-line no-console
          console.warn(`No answers field found in ${fileName}`);
          continue;
        }

        // Build a record following sortedElements order
        const record: Record<string, Field> = {};
        // submission id and createdAt (if present in JSON)
        record["__submissionId"] = (jsonData.name ?? jsonData.id ?? "") as unknown as Field;
        // createdAt may be a number (ms) or an ISO string — coerce safely
        let createdAtIso = "";
        if (jsonData && typeof (jsonData as Record<string, unknown>).createdAt !== "undefined") {
          const rawCreated = (jsonData as Record<string, unknown>).createdAt;
          if (typeof rawCreated === "number") {
            createdAtIso = new Date(rawCreated).toISOString();
          } else if (typeof rawCreated === "string") {
            // If it's numeric string, try Number first, otherwise parse as date string
            const asNumber = Number(rawCreated);
            if (!Number.isNaN(asNumber)) {
              createdAtIso = new Date(asNumber).toISOString();
            } else {
              const parsed = new Date(rawCreated);
              if (!Number.isNaN(parsed.getTime())) createdAtIso = parsed.toISOString();
            }
          }
        }
        record["__createdAt"] = (createdAtIso as Field) || ("" as Field);

        const specialChars = ["=", "+", "-", "@"];

        for (const element of sortedElements) {
          const qid = String(element.id);
          const rawAnswer = answersObj[qid];

          const formatAnswer = (v: unknown) => helperFormatAnswer(v, specialChars);

          if (element.type === FormElementTypes.dynamicRow) {
            record[qid] = renderDynamicRow(element, rawAnswer, formatAnswer) as Field;
            continue;
          }

          if (element.type === FormElementTypes.checkbox) {
            if (Array.isArray(rawAnswer)) {
              record[qid] = (rawAnswer as unknown[]).map((v) => String(v)).join(", ") as Field;
            } else {
              record[qid] = formatAnswer(rawAnswer);
            }
            continue;
          }

          if (element.type === FormElementTypes.fileInput) {
            if (rawAnswer && typeof rawAnswer === "object") {
              const obj = rawAnswer as Record<string, unknown>;
              if ("name" in obj && typeof obj.name === "string") {
                record[qid] = obj.name as Field;
              } else {
                record[qid] = formatAnswer(rawAnswer);
              }
            } else {
              record[qid] = formatAnswer(rawAnswer);
            }
            continue;
          }

          if (element.type === FormElementTypes.formattedDate) {
            try {
              if (typeof rawAnswer === "string") {
                const maybeObj = JSON.parse(rawAnswer);
                if (maybeObj && typeof maybeObj === "object" && "YYYY" in maybeObj) {
                  record[qid] = String(rawAnswer) as Field;
                } else {
                  record[qid] = formatAnswer(rawAnswer);
                }
              } else {
                record[qid] = formatAnswer(rawAnswer);
              }
            } catch (e) {
              record[qid] = formatAnswer(rawAnswer);
            }
            continue;
          }

          record[qid] = formatAnswer(rawAnswer);
        }

        // receipt placeholder
        record["__receipt"] =
          "Receipt codes are in the Official receipt and record of responses\nLes codes de réception sont dans le Reçu et registre officiel des réponses" as Field;

        recordsData.push(record as Record<string, unknown>);
      } catch (parseError) {
        // eslint-disable-next-line no-console
        console.error(`Failed to parse ${fileName}:`, parseError);
      }
    }

    if (recordsData.length === 0) {
      // eslint-disable-next-line no-console
      console.warn("No valid answers data found to convert to CSV");
      return;
    }

    // Create CSV file using csv-writer
    const csvFileName = `${formId}-responses-${Date.now()}.csv`;
    const csvFileHandle = await dirHandle.getFileHandle(csvFileName, { create: true });

    const csvWriter = createObjectCsvWriter({
      fileHandle: csvFileHandle as FileSystemFileHandle,
      header: headers,
      alwaysQuote: true,
    });

    // Convert recordsData to the Field-typed records expected by csv-writer
    const csvRecords: Record<string, Field>[] = recordsData.map((r) => {
      const out: Record<string, Field> = {};
      Object.entries(r).forEach(([k, v]) => {
        if (
          v === null ||
          v === undefined ||
          typeof v === "string" ||
          typeof v === "number" ||
          typeof v === "boolean"
        ) {
          out[k] = v as Field;
        } else {
          out[k] = String(v) as Field;
        }
      });
      return out;
    });

    await csvWriter.writeRecords(csvRecords);

    // eslint-disable-next-line no-console
    console.log(`CSV file created: ${csvFileName} with ${recordsData.length} responses`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error processing JSON to CSV:", error);
  }
};
