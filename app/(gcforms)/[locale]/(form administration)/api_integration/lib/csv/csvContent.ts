import { FormProperties, FormElement, FormElementTypes, Response } from "@gcforms/types";
import { sortByLayout } from "@lib/utils/form-builder";
import type { Field } from "./csv-writer/lib/record";

import { customTranslate } from "@lib/i18nHelpers";
import { mapAnswers, type MappedAnswer } from "../mapAnswers/mapAnswers";

export const sortElements = ({ formTemplate }: { formTemplate: FormProperties }) => {
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
  return headers;
};

export const buildRecords = ({
  formTemplate,
  rawAnswers,
  sortedElements,
}: {
  formTemplate: FormProperties;
  rawAnswers: Record<string, unknown>;
  sortedElements: FormElement[];
}): Array<Record<string, Field>> => {
  // Build a record following sortedElements order
  const record: Record<string, Field> = {};
  const recordsData: Array<Record<string, Field>> = [];

  // Map answers from the template + raw responses
  const mappedAnswers = mapAnswers({
    // mapAnswers expects a formTemplate and rawAnswers fields.
    formTemplate,
    rawAnswers: rawAnswers as unknown as Response,
  });

  // Build a lookup by question id for quick access
  const mappedByQuestionId = new Map<string, MappedAnswer>();
  if (Array.isArray(mappedAnswers)) {
    mappedAnswers.forEach((m) => {
      if (typeof m !== "string" && (m as { questionId?: number }).questionId !== undefined) {
        mappedByQuestionId.set(
          String((m as { questionId?: number }).questionId),
          m as MappedAnswer
        );
      }
    });
  }

  // Build a record following sortedElements order
  for (const element of sortedElements) {
    const qid = String(element.id);
    const rawAnswer = (rawAnswers as Record<string, unknown>)[qid];

    // If mapAnswers produced a value for this question, prefer that
    const mapped = mappedByQuestionId.get(qid);
    if (mapped) {
      // Prefer mapped answers; if mapped value is missing/empty, treat as no-answer
      const mappedVal =
        typeof mapped === "string" ? mapped : (mapped as { answer?: unknown }).answer;
      if (mappedVal === null || mappedVal === undefined || mappedVal === "") {
        record[qid] = "-" as Field;
      } else if (
        typeof mappedVal === "string" ||
        typeof mappedVal === "number" ||
        typeof mappedVal === "boolean"
      ) {
        record[qid] = mappedVal as Field;
      } else {
        try {
          record[qid] = JSON.stringify(mappedVal) as Field;
        } catch (e) {
          record[qid] = String(mappedVal) as Field;
        }
      }
      continue;
    }
    // No mapped value — just pass the raw answer through with minimal
    // coercion. Tests/consumers expect primitive types or strings; for
    // complex objects, stringify them.
    if (rawAnswer === null || rawAnswer === undefined) {
      record[qid] = "-" as Field;
    } else if (
      typeof rawAnswer === "string" ||
      typeof rawAnswer === "number" ||
      typeof rawAnswer === "boolean"
    ) {
      record[qid] = rawAnswer as Field;
    } else {
      try {
        record[qid] = JSON.stringify(rawAnswer) as Field;
      } catch (e) {
        record[qid] = String(rawAnswer) as Field;
      }
    }
  }

  // receipt placeholder
  record["__receipt"] =
    "Receipt codes are in the Official receipt and record of responses\nLes codes de réception sont dans le Reçu et registre officiel des réponses" as Field;

  recordsData.push(record);
  return recordsData;
};

export const buildCsvContent = ({
  formTemplate,
  rawAnswers,
}: {
  formTemplate: FormProperties;
  rawAnswers: Record<string, unknown>;
}) => {
  const headers = getHeaders({ sortedElements: sortElements({ formTemplate }) });

  const records = buildRecords({
    formTemplate,
    rawAnswers,
    sortedElements: sortElements({ formTemplate }),
  });

  return { headers, records };
};
