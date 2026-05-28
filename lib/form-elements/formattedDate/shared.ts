import { DateFormat, DateObject } from "@clientComponents/forms/FormattedDate/types";
import {
  getFormattedDateFromObject,
  isValidDateObject,
} from "@clientComponents/forms/FormattedDate/utils";
import { logMessage } from "@lib/logger";
import { type SharedElementDefinition } from "@lib/form-elements/sharedHooks";

const getDateAsString = (answer: DateObject | string | object, dateFormat: DateFormat): string => {
  try {
    if (typeof answer === "object" && "YYYY" in answer && "MM" in answer && "DD" in answer) {
      return getFormattedDateFromObject(dateFormat, answer as DateObject);
    }

    const dateObject = JSON.parse(answer as string) as DateObject;
    return getFormattedDateFromObject(dateFormat, dateObject);
  } catch {
    return answer as string;
  }
};

const deserializeDateObject = (value: string): DateObject | string => {
  try {
    const parsed = JSON.parse(value);

    if (isValidDateObject(parsed)) {
      return parsed;
    }
  } catch (error) {
    logMessage.info(`Failed to parse date object value: ${value}, error: ${JSON.stringify(error)}`);
  }

  return value;
};

export const sharedDefinition: SharedElementDefinition = {
  normalizeResponse: (value) => {
    if (typeof value === "string") {
      return deserializeDateObject(value);
    }

    return value;
  },
  answerToString: (question, answer) => {
    if (!answer) {
      return "";
    }

    const dateFormat = (question.properties.dateFormat || "YYYY-MM-DD") as DateFormat;
    return getDateAsString(answer as DateObject | string | object, dateFormat);
  },
  getErrorListMessage: ({ question, language, t }) => {
    return t("input-validation.error-list.date-invalid", {
      question,
      lng: language,
      interpolation: {
        escapeValue: false,
      },
    });
  },
};
