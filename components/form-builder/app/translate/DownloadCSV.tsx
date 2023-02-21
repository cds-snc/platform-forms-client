import React from "react";
import { useTranslation } from "next-i18next";
import { useTemplateStore } from "../../store/useTemplateStore";
import { Button } from "../shared/Button";
import { FormElement } from "@lib/types";

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

const formatText = (str: string) => `"${str}"`;

export const DownloadCSV = () => {
  const form = useTemplateStore((s) => s.form);
  const { t } = useTranslation("form-builder");

  let elementIndex = 0;
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  const data = [["description", "english", "french"]];

  const parseElement = (element: FormElement, index: string | number) => {
    const description = element.type === "richText" ? "Page text" : `Question ${index}`;

    if (element.type === "dynamicRow") {
      let subElementIndex = -1;
      data.push([
        description,
        formatText(element.properties.titleEn),
        formatText(element.properties.titleFr),
      ]);

      element.properties.subElements?.map((subElement) => {
        subElementIndex++;
        parseElement(subElement, alphabet[subElementIndex]);
      });

      return;
    }
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
  };

  const generateCSV = async () => {
    data.push(["Form introduction - Title", formatText(form.titleEn), formatText(form.titleFr)]);
    data.push([
      "Form introduction - Description",
      formatText(form.introduction?.descriptionEn ?? ""),
      formatText(form.introduction?.descriptionFr ?? ""),
    ]);

    form.elements.map((element) => {
      elementIndex++;
      parseElement(element, elementIndex);
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
