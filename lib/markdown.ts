import json2md from "json2md";
import logger from "@lib/logger";
import { Submission } from "./types";
import { extractFormData } from "./integration/helpers";

export default logger((formResponse: Submission): string => {
  const subjectEn = formResponse.form.emailSubjectEn
    ? formResponse.form.emailSubjectEn
    : formResponse.form.titleEn;
  const subjectFr = formResponse.form.emailSubjectFr
    ? formResponse.form.emailSubjectFr
    : formResponse.form.titleFr;

  const title = `${subjectEn} / ${subjectFr}`;

  const stringifiedData = extractFormData(formResponse);
  const mdBody = stringifiedData.map((item) => {
    return { p: item };
  });
  const emailBody = json2md([{ h1: title }, mdBody]);

  return emailBody;
});
