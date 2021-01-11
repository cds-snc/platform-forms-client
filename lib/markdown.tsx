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
    const qSequence = index + 1;
    const qTitle = element.properties.titleEn;
    return `${qSequence.toString()}. ${qTitle}
    ${responses[element.id]}
    `;
  });

  return `
    # ${title}

    ${mdBody.join("")}
    `;
};
