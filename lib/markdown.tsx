import json2md from "json2md";
import logger from "../lib/logger";

interface Response {
  form: {
    titleEn: string;
    titleFr: string;
    elements: {
      id: string | number;
      titleEn: string;
      properties: Record<string, string>;
    }[];
  };
  responses: {
    [key: string]: string | [];
  };
}
export default logger((formResponse: Response): string => {
  const formElements = formResponse.form.elements;
  const responses = formResponse.responses;
  const title = `${formResponse.form.titleEn} / ${formResponse.form.titleFr}`;

  const mdBody = formElements.map((element) => {
    // In future add validation to remove page elements
    const qTitle = element.properties.titleEn;
    const currentId = `${element.id}`;

    if (Array.isArray(responses[currentId])) {
      if (responses[currentId].length) {
        const options = (responses[currentId] as Array<string>)
          .map((option: string) => {
            return `- ${option}`;
          })
          .join(String.fromCharCode(13));

        return {
          p: `${qTitle}${String.fromCharCode(13)}${options}`,
        };
      } else {
        return {
          p: `${qTitle}${String.fromCharCode(13)}- No response`,
        };
      }
    } else {
      const response = responses[currentId];
      if (response !== undefined && response !== null) {
        return {
          p: `${qTitle}${String.fromCharCode(13)}-${response}`,
        };
      } else {
        return {
          p: `${qTitle}${String.fromCharCode(13)}- No Response`,
        };
      }
    }
  });

  const emailBody = json2md([{ h1: title }, mdBody]);

  return emailBody;
});
