"use client";

import React, { useCallback, useState } from "react";

import { CopyIcon } from "@serverComponents/icons/CopyIcon";
import { FormElement } from "@lib/types";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "react-i18next";

export const CopyItem = ({ item }: { item: FormElement | undefined }) => {
  const { t } = useTranslation("form-builder");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(() => {
    const itemJson = {
      type: item?.type,
      properties: {
        subElements: [],
        choices: item?.properties.choices || [{ en: "", fr: "" }],
        titleEn: item?.properties.titleEn || "",
        titleFr: item?.properties.titleFr || "",
        validation: item?.properties.validation || {
          required: false,
        },
        descriptionEn: item?.properties.descriptionEn || "",
        descriptionFr: item?.properties.descriptionFr || "",
        placeholderEn: item?.properties.placeholderEn || "",
        placeholderFr: item?.properties.placeholderFr || "",
        conditionalRules: undefined,
      },
    };
    navigator.clipboard.writeText(JSON.stringify(itemJson, null, 2));

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [item]);

  return (
    <div className="flex items-center">
      <Button
        theme="secondary"
        className=""
        onClick={copyToClipboard}
        data-testid="copy-item-button"
      >
        <>
          <CopyIcon className="mr-2" />
          {copied ? (
            <span>{t("element.copyButton.copied")}</span>
          ) : (
            <span>{t("element.copyButton.text")}</span>
          )}
        </>
      </Button>
    </div>
  );
};
