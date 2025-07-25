"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Button } from "@clientComponents/globals";
import { FormElement } from "@lib/types";
import { getDate, slugify } from "@lib/client/clientHelpers";
import { sortGroup } from "@lib/utils/form-builder/groupedFormHelpers";

const formatText = (str: string) => `"${str}"`;

export const DownloadCSVWithGroups = () => {
  const { form, name } = useTemplateStore((s) => ({ form: s.form, name: s.name }));
  const { t, i18n } = useTranslation("form-builder");

  let data = [];

  const parseElement = (element: FormElement) => {
    const description =
      element.type === "richText" ? formatText("Page text/Texte de page") : formatText("");

    if (element.type === "dynamicRow") {
      data.push([
        description,
        formatText(element.properties.titleEn),
        formatText(element.properties.titleFr),
      ]);

      element.properties.subElements?.map((subElement) => {
        parseElement(subElement);
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
          data.push([
            `${description} Option ${choiceIndex + 1}`,
            formatText(choice.en),
            formatText(choice.fr),
          ]);
        }
      });
    }
  };

  const generateCSV = async () => {
    data = [
      [formatText("Description"), formatText("English/Anglais"), formatText("French/Français")],
    ];
    data.push([formatText("Title/Titre"), formatText(form.titleEn), formatText(form.titleFr)]);
    data.push([
      formatText("Description"),
      formatText(form.introduction?.descriptionEn ?? ""),
      formatText(form.introduction?.descriptionFr ?? ""),
    ]);

    if (form.privacyPolicy?.descriptionEn || form.privacyPolicy?.descriptionFr) {
      data.push([
        formatText("Privacy statement/Avis de confidentialité"),
        formatText(form.privacyPolicy.descriptionEn),
        formatText(form.privacyPolicy.descriptionFr),
      ]);
    }

    // Sort thorugh the groups....
    if (form.groups) {
      const groups = form.groups;
      Object.keys(groups).map((groupKey) => {
        const group = groups[groupKey];
        const groupElements = sortGroup({ form, group });

        data.push([
          formatText(`Page: ` + group.name),
          formatText(group.titleEn),
          formatText(group.titleFr),
        ]);

        groupElements.map((element) => {
          parseElement(element);
        });
      });
    }

    if (form.confirmation?.descriptionEn || form.confirmation?.descriptionFr) {
      data.push([
        formatText("Confirmation message/Message de confirmation"),
        formatText(form.confirmation.descriptionEn),
        formatText(form.confirmation.descriptionFr),
      ]);
    }

    const csv = data.map((row) => row.join(",")).join("\n");

    // Windows saves CSV files by default as ANSI. This forces UTF-8.
    // More info: https://github.com/cds-snc/platform-forms-client/issues/2616
    const forceUTF8 = "\uFEFF";

    const blob = new Blob([forceUTF8 + csv], { type: "application/csv" });

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
