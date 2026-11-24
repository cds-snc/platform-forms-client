"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { getIn, setIn, type FormikErrors, type FormikProps } from "formik";
import { isFieldResponseValid } from "@gcforms/core";
import type { FormElement, Language, Responses } from "@gcforms/types";
import { formatErrors } from "@lib/validation/formatErrors";

// Formik stores structured errors; the adapter exposes translated strings to existing components.
// This context lets the character counter work with the underlying codes for its form
// without passing helpers through every component or keeping a second error store.
// We could pass these helpers as props instead, but context avoids that prop-drilling.

type StructuredErrors = {
  getErrorCode: (name: string) => string | undefined;
  updateCharacterError: (name: string, value: string, maxLength: number) => void;
};

export const StructuredErrorsContext = createContext<StructuredErrors | undefined>(undefined);
export const useStructuredErrors = () => useContext(StructuredErrorsContext);

const getErrorCode = (errors: FormikErrors<Responses>, name: string) => {
  const error: unknown = getIn(errors, name);
  if (error === null || typeof error !== "object") return undefined;
  if (!("code" in error)) return undefined;
  return typeof error.code === "string" ? error.code : undefined;
};

const getFieldElement = (elements: FormElement[], name: string): FormElement | undefined => {
  const [elementId, ...repeatingPath] = name.split(".");
  let element = elements.find((element) => String(element.id) === elementId);

  // Repeating paths use row/subelement pairs (why mod used below): "12.0.1" means element 12, row 0, subelement 1
  if (repeatingPath.length % 2 !== 0) return undefined;

  for (let position = 0; position < repeatingPath.length; position += 2) {
    if (!element) return undefined;

    const rowIndex = repeatingPath[position];
    const subElementIndex = repeatingPath[position + 1];
    if (!/^\d+$/.test(rowIndex) || !/^\d+$/.test(subElementIndex)) return undefined;

    element = element.properties.subElements?.[Number(subElementIndex)];
  }

  return element;
};

/**
 * Keep error codes in Formik and give existing components translated messages.
 * Errors are keyed by field, with nested errors for repeating sets and address fields forming a tree.
 * Codes and messages share this state, so replacing or clearing an error keeps them in sync.
 */
export const useFormattedFormik = (
  raw: FormikProps<Responses>,
  elements: FormElement[],
  language: Language,
  t: Parameters<typeof formatErrors>[3]
): { formik: FormikProps<Responses>; structuredErrors: StructuredErrors } => {
  // Our errors include strings, code objects, and nested row/address errors.
  // Formik derives error types from answer types, which don't describe all these shapes,
  // so we adapt the formatted result to its expected type.
  const format = useCallback(
    <Values = Responses,>(errors: FormikErrors<Responses>) =>
      formatErrors(errors, elements, language, t) as FormikErrors<Values>,
    [elements, language, t]
  );
  const errors = useMemo(() => format(raw.errors), [format, raw.errors]);
  const initialErrors = useMemo(() => format(raw.initialErrors), [format, raw.initialErrors]);
  const formatResult = (result: void | FormikErrors<Responses>) =>
    result === undefined ? undefined : format(result);

  const setFieldValue: typeof raw.setFieldValue = (...args) =>
    raw.setFieldValue(...args).then(formatResult);
  const setFieldTouched: typeof raw.setFieldTouched = (...args) =>
    raw.setFieldTouched(...args).then(formatResult);

  // Wrap Formik so components read translated strings while it stores structured errors.
  // Keep its existing behavior, but format errors exposed by properties and helper methods.
  const formik: FormikProps<Responses> = {
    ...raw,
    errors,
    initialErrors,
    getFieldMeta: (name) => ({
      ...raw.getFieldMeta(name),
      error: getIn(errors, name),
      initialError: getIn(initialErrors, name),
    }),
    setFieldValue,
    setFieldTouched,
    setValues: (...args) => raw.setValues(...args).then(formatResult),
    setTouched: (...args) => raw.setTouched(...args).then(formatResult),
    validateForm: async (...args) => format(await raw.validateForm(...args)),
    getFieldHelpers: <Value,>(name: string) => ({
      setValue: (value: Value, shouldValidate?: boolean) =>
        raw
          .setFieldValue(name, value, shouldValidate)
          .then((result) => (result === undefined ? undefined : format<Value>(result))),
      setTouched: (touched: boolean, shouldValidate?: boolean) =>
        raw
          .setFieldTouched(name, touched, shouldValidate)
          .then((result) => (result === undefined ? undefined : format<Value>(result))),
      setError: (error) => raw.setFieldError(name, error),
    }),
    setFormikState: (update) => {
      raw.setFormikState((previous) => {
        const displayedErrors = format(previous.errors);
        const next =
          typeof update === "function" ? update({ ...previous, errors: displayedErrors }) : update;
        return {
          ...next,
          errors: next.errors === displayedErrors ? previous.errors : next.errors,
        };
      });
    },
  };

  return {
    formik,
    structuredErrors: {
      getErrorCode: (name) => getErrorCode(raw.errors, name),
      updateCharacterError: (name, value, maxLength) => {
        const element = getFieldElement(elements, name);
        if (!element) return;
        raw.setFormikState((previous) => {
          const code = getErrorCode(previous.errors, name);
          if (code !== "max-length" && (code !== "required" || value.length <= maxLength)) {
            return previous;
          }
          const error = isFieldResponseValid(value, element);
          return { ...previous, errors: setIn(previous.errors, name, error ?? undefined) };
        });
      },
    },
  };
};
