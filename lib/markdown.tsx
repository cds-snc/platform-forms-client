import json2md from "json2md";

// Redo this interface and remember that that it's an Array and not an object.
interface Response {
  form: {
    titleEn: string;
    titleFr: string;
    elements: [
      {
        id: string | number;
        titleEn: string;
        properties: Record<string, string>;
      }
    ];
  };
  responses: {
    [key: string]: string;
  };
}
export default (formResponse: Response): string => {
  const formElements = formResponse.form.elements;
  const responses = formResponse.responses;
  const title = `${formResponse.form.titleEn} / ${formResponse.form.titleFr}`;

  const mdBody = formElements.map((element, index) => {
    // In future add validation to remove page elements
    const qTitle = element.properties.titleEn;
    return {
      p: `${qTitle}${String.fromCharCode(13)} ${responses[element.id]}`,
    };
  });

  const emailBody = json2md([{ h1: title }, mdBody]);

  return emailBody;
};
