import React from "react";
import { useTranslation } from "next-i18next";
import { useTemplateStore } from "../../store/useTemplateStore";
import { Button } from "@components/globals";
import { FormElement } from "@lib/types";
import { getDate, slugify } from "@lib/clientHelpers";
import { alphabet } from "../../util";

const formatText = (str: string) => `"${str}"`;

export const DownloadCSV = () => {
  const { form, name } = useTemplateStore((s) => ({ form: s.form, name: s.name }));
  const { t, i18n } = useTranslation("form-builder");

  let elementIndex = 0;
  let data = [];

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
    data = [["description", "english", "french"]];
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

    const fileName = name ? name : i18n.language === "fr" ? form.titleFr : form.titleEn;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = slugify(`${fileName}-${getDate()}`) + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={generateCSV} theme="secondary">
      {t("downloadCSV")}
    </Button>
  );
};
