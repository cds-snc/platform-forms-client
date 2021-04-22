import json2md from "json2md";
import logger from "../lib/logger";
import { Submission } from "./types";
import { extractFormData, rehydrateFormResponses } from "./dataLayer";

export default logger((formResponse: Submission): string => {
  const title = `${formResponse.form.titleEn} / ${formResponse.form.titleFr}`;
  const rehydratedResponses = rehydrateFormResponses(formResponse);
  const stringifiedData = extractFormData({
    ...formResponse,
    responses: rehydratedResponses,
  });
  const mdBody = stringifiedData.map((item) => {
    return { p: item };
  });
  const emailBody = json2md([{ h1: title }, mdBody]);

  return emailBody;
});
