import json2md from "json2md";
import logger from "@lib/logger";
import { extractFormData } from "./helpers";
import { Submission } from "@lib/types";

export default logger((formResponse: Submission): string => {
  const formResponseFormObject = formResponse.form.form;
  const subjectEn = formResponseFormObject.emailSubjectEn
    ? formResponseFormObject.emailSubjectEn
    : formResponseFormObject.titleEn;
  const subjectFr = formResponseFormObject.emailSubjectFr
    ? formResponseFormObject.emailSubjectFr
    : formResponseFormObject.titleFr;

  const title = `${subjectEn} / ${subjectFr}`;

  const stringifiedData = extractFormData(formResponse);
  const mdBody = stringifiedData.map((item) => {
    return { p: item };
  });
  const emailBody = json2md([{ h1: title }, mdBody]);

  return emailBody;
});
