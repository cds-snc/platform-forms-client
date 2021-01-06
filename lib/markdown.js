import json2md from "json2md";

export default (formResponse) => {
  const formElements = formResponse.form.elements;
  const responses = formResponse.responses;
  const title = `${formResponse.form.titleEn} / ${formResponse.form.titleFr}`;

  const mdBody = formElements.map((element, index) => {
    // In future add validation to remove page elements
    const qSequence = index.toString();
    const qTitle = element.properties.titleEn;
    return `${qSequence}. ${qTitle}
    ${responses[index]}`;
  });

  return json2md([
    {
      h1: title,
    },
    {
      p: mdBody,
    },
  ]);
};
