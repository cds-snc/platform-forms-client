import type { Field } from "./csv-writer/lib/record";
import type { FormElement } from "@lib/types";

export const parseAnswersField = (
  jsonData: Record<string, unknown>
): Record<string, unknown> | null => {
  if (!jsonData || typeof jsonData !== "object") return null;
  const v = (jsonData as Record<string, unknown>)["answers"];
  if (!v) return null;
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return typeof parsed === "object" && parsed !== null
        ? (parsed as Record<string, unknown>)
        : null;
    } catch (e) {
      // parsing failed
      return null;
    }
  }
  if (typeof v === "object") return v as Record<string, unknown>;
  return null;
};

export const formatAnswer = (
  val: unknown,
  specialChars: string[] = ["=", "+", "-", "@"]
): Field => {
  if (val === null || val === undefined || val === "") return "-";
  if (typeof val === "string") {
    const s = val as string;
    return (specialChars.some((c) => s.startsWith(c)) ? `'${s}` : s) as Field;
  }
  if (typeof val === "number" || typeof val === "boolean") return val as Field;
  try {
    return JSON.stringify(val) as Field;
  } catch (e) {
    return String(val) as Field;
  }
};

export const renderDynamicRow = (
  element: FormElement,
  rawAnswer: unknown,
  formatFn: (v: unknown) => Field
): string => {
  if (!Array.isArray(rawAnswer)) return "-";
  const props = element.properties as unknown as Record<string, unknown> | undefined;
  const subElements = Array.isArray(props?.subElements) ? (props.subElements as FormElement[]) : [];

  const rowsText = (rawAnswer as unknown[])
    .map((row) => {
      if (row && typeof row === "object") {
        // For each sub-element, emit an English title line, then a French title line with the value
        return subElements
          .map((subEl) => {
            const props = subEl.properties as unknown as Record<string, unknown> | undefined;
            const key =
              subEl.id ??
              (props && "questionId" in props ? props["questionId"] : undefined) ??
              null;
            const val = key ? (row as Record<string, unknown>)[String(key)] : undefined;
            const titleEn =
              props && typeof props["titleEn"] === "string" ? (props["titleEn"] as string) : "";
            const titleFr =
              props && typeof props["titleFr"] === "string" ? (props["titleFr"] as string) : "";

            // Build two lines: EN title on its own line, then FR title + ': ' + value
            const valueText = String(formatFn(val));
            const frLine = titleFr ? `${titleFr}: ${valueText}` : `${titleEn}: ${valueText}`;
            // If we have an English title, show it on the line above.
            return titleEn ? `${titleEn}\n${frLine}` : frLine;
          })
          .join(" \n");
      }
      return String(formatFn(row));
    })
    .join("\n\n");

  return rowsText || "-";
};

const helpers = { parseAnswersField, formatAnswer, renderDynamicRow };
export default helpers;
