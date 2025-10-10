import { FormProperties, FormElement, FormElementTypes, Response } from "@gcforms/types";
import { sortByLayout } from "@lib/utils/form-builder";
import type { Field } from "./csv-writer/lib/record";

const specialChars = ["=", "+", "-", "@"];
import { customTranslate } from "@lib/i18nHelpers";
import { mapAnswers, type MappedAnswer } from "./mapAnswers/mapAnswers";

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
  rawAnswers: Response;
  sortedElements: FormElement[];
}): Array<Record<string, Field>> => {
  // Map answers from the template + raw responses
  const mappedAnswers = mapAnswers({
    // mapAnswers expects a formTemplate and rawAnswers fields.
    formTemplate,
    rawAnswers,
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
  const answers = sortedElements.map((element) => {
    const answer = mappedByQuestionId.get(String(element.id));
    if (!answer) {
      return "-";
    }
    if (answer instanceof Array) {
      return answer
        .map((answer) =>
          answer
            .map((subAnswer: { questionEn: string; questionFr: string; answer: string }) => {
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
    let answerText = answer as string;
    if (specialChars.some((char) => answerText.startsWith(char))) {
      answerText = `'${answerText}`;
    }
    if (answerText == "") {
      answerText = "-";
    }
    return answerText;
  });

  const recordsData: Array<Record<string, Field>> = [];

  if (answers.length === 0) return recordsData;

  const record: Record<string, Field> = {};
  // Map answers array back to element ids in sortedElements order
  sortedElements.forEach((el, idx) => {
    const qid = String(el.id);
    const val = answers[idx];
    record[qid] = (val === null || val === undefined ? "-" : (val as unknown)) as Field;
  });

  // created at and receipt
  record["__createdAt"] = String(new Date().toISOString()) as Field;
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
  rawAnswers: Response;
}) => {
  const headers = getHeaders({ sortedElements: sortElements({ formTemplate }) });

  const records = buildRecords({
    formTemplate,
    rawAnswers,
    sortedElements: sortElements({ formTemplate }),
  });

  return { headers, records };
};
