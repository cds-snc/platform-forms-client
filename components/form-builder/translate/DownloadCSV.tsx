import React from "react";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import markdownToTxt from "markdown-to-txt";

const DownloadCSVButton = styled.button`
  border: 2px solid #26374a;
  border-radius: 10px;
  background: #fff;
  padding: 10px 25px;
  margin: 10px 0 30px 0;
`;

const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getDate = () => {
  let date = new Date();
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - offset * 60 * 1000);
  return date.toISOString().split("T")[0];
};

export const DownloadCSV = () => {
  const { form } = useTemplateStore();

  const generateCSV = async () => {
    const data = [["description", "english", "french"]];

    data.push(["Form introduction - Title", form.titleEn, form.titleFr]);
    data.push([
      "Form introduction - Description",
      form.introduction.descriptionEn,
      form.introduction.descriptionFr,
    ]);

    let questionIndex = 1;

    form.elements.map((element) => {
      const description = element.type === "richText" ? "Page text" : `Question ${questionIndex++}`;

      if (element.properties.titleEn || element.properties.titleFr) {
        data.push([description, element.properties.titleEn, element.properties.titleFr]);
      }

      if (element.properties.descriptionEn || element.properties.descriptionFr) {
        data.push([
          description,
          markdownToTxt(element.properties.descriptionEn),
          markdownToTxt(element.properties.descriptionFr),
        ]);
      }

      if (element.properties.choices) {
        element.properties.choices.map((choice, choiceIndex) => {
          if (choice.en || choice.fr) {
            data.push([`${description} - Option ${choiceIndex + 1}`, choice.en, choice.fr]);
          }
        });
      }
    });

    if (form.privacyPolicy.descriptionEn || form.privacyPolicy.descriptionFr) {
      data.push([
        "Privacy statement",
        form.privacyPolicy.descriptionEn,
        form.privacyPolicy.descriptionFr,
      ]);
    }

    if (form.endPage.descriptionEn || form.endPage.descriptionFr) {
      data.push(["Confirmation message", form.endPage.descriptionEn, form.endPage.descriptionFr]);
    }

    const csv = data.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "application/csv" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = slugify(`${form.titleEn}-${getDate()}`) + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return <DownloadCSVButton onClick={generateCSV}>Download .csv</DownloadCSVButton>;
};
