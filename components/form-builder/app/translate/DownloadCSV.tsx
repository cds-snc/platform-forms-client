import React from "react";
import { useTranslation } from "next-i18next";
import { useTemplateStore } from "../../store/useTemplateStore";
import markdownToTxt from "markdown-to-txt";
import { Button } from "../shared/Button";

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

/**
 * Add a space behind all sets of octothorphes
 *
 * NOTE: This is necessary because our RichTextEditor is not serializing headings
 * correctly. We should aim to fix with the next iteration.
 */
const fixMarkdownHeadings = (str: string) => str.replace(/#{1,6}/g, "$& ").replace(/  +/g, " ");

const formatText = (str: string) => `"${markdownToTxt(fixMarkdownHeadings(str))}"`;

export const DownloadCSV = () => {
  const form = useTemplateStore((s) => s.form);
  const { t } = useTranslation("form-builder");

  const generateCSV = async () => {
    const data = [["description", "english", "french"]];

    data.push(["Form introduction - Title", formatText(form.titleEn), formatText(form.titleFr)]);
    data.push([
      "Form introduction - Description",
      formatText(form.introduction?.descriptionEn ?? ""),
      formatText(form.introduction?.descriptionFr ?? ""),
    ]);

    let questionIndex = 1;

    form.elements.map((element) => {
      const description = element.type === "richText" ? "Page text" : `Question ${questionIndex++}`;

      if (element.properties.titleEn || element.properties.titleFr) {
        data.push([
          description,
          formatText(element.properties.titleEn),
          formatText(element.properties.titleFr),
        ]);
      }

      if (element.properties.descriptionEn || element.properties.descriptionFr) {
        data.push([
          description,
          formatText(element.properties.descriptionEn ?? ""),
          formatText(element.properties.descriptionFr ?? ""),
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

    if (form.privacyPolicy?.descriptionEn || form.privacyPolicy?.descriptionFr) {
      data.push([
        "Privacy statement",
        formatText(form.privacyPolicy.descriptionEn),
        formatText(form.privacyPolicy.descriptionFr),
      ]);
    }

    if (form.confirmation?.descriptionEn || form.confirmation?.descriptionFr) {
      data.push([
        "Confirmation message",
        formatText(form.confirmation.descriptionEn),
        formatText(form.confirmation.descriptionFr),
      ]);
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

  return (
    <Button onClick={generateCSV} theme="secondary">
      {t("downloadCSV")}
    </Button>
  );
};
