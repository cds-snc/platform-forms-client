"use client";

import React, { useCallback, useState } from "react";

import { CopyIcon } from "@serverComponents/icons/CopyIcon";
import { CheckIcon } from "@serverComponents/icons/CheckIcon";
import { FormElement } from "@lib/types";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "react-i18next";
import { useIsAdminUser } from "@lib/hooks/form-builder/useIsAdminUser";

export const CopyItem = ({ item }: { item: FormElement | undefined }) => {
  const allowCopyButton = useIsAdminUser();

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
        autoComplete: item?.properties.autoComplete,
      },
    };

    navigator.clipboard.writeText(JSON.stringify(itemJson, null, 2));

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [item]);

  if (!allowCopyButton) {
    return null;
  }

  return (
    <div className="mr-6 flex w-full justify-end">
      <Button
        theme="secondary"
        className="[&_svg]:focus:fill-white"
        onClick={copyToClipboard}
        data-testid="copy-item-button"
      >
        <>
          {copied ? <CheckIcon className="mr-2 size-4" /> : <CopyIcon className="mr-2 size-4" />}

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
