import json2md from "json2md";

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
export default (formResponse: Response): string => {
  const formElements = formResponse.form.elements;
  const responses = formResponse.responses;
  const title = `${formResponse.form.titleEn} / ${formResponse.form.titleFr}`;

  const mdBody = formElements.map((element) => {
    // In future add validation to remove page elements
    const qTitle = element.properties.titleEn;
    if (Array.isArray(responses[element.id])) {
      if (responses[element.id].length) {
        const options = (responses[element.id] as Array<string>)
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
      const response = responses[element.id];
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
};
