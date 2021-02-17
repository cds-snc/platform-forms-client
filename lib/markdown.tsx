import json2md from "json2md";
import logger from "../lib/logger";
import { FormMetadataProperties, Responses } from "./types";
import { extractFormData } from "./dataLayer";

interface Submission {
  form: FormMetadataProperties;
  responses: Responses;
}

export default logger((formResponse: Submission): string => {
  const title = `${formResponse.form.titleEn} / ${formResponse.form.titleFr}`;
  const stringifiedData = extractFormData(formResponse);
  const mdBody = stringifiedData.map((item) => {
    return { p: item };
  });
  const emailBody = json2md([{ h1: title }, mdBody]);

  return emailBody;
});
