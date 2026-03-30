"use client";
import React, { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { stringifyChoiceOptionsCsv } from "@clientComponents/forms/ChoiceOptionsCsvUpload";
import { type PropertyChoices } from "@lib/types";
import { CheckIcon } from "@serverComponents/icons/CheckIcon";
import { CopyIcon } from "@serverComponents/icons/CopyIcon";

export const CopyChoiceOptionsCsvButton = ({ choices }: { choices?: PropertyChoices[] }) => {
  const { t } = useTranslation("form-builder");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    if (!choices?.length) {
      return;
    }

    await navigator.clipboard.writeText(stringifyChoiceOptionsCsv(choices));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [choices]);

  if (!choices?.length) {
    return null;
  }

  return (
    <Button
      theme="link"
      className="!m-0 !mt-4 !w-56 justify-start focus:[&_svg]:fill-white"
      onClick={copyToClipboard}
    >
      <>
        {copied ? <CheckIcon className="mr-2 size-4" /> : <CopyIcon className="mr-2 size-4" />}
        <span>
          {copied ? t("choiceOptionsUpload.copyButtonCopied") : t("choiceOptionsUpload.copyButton")}
        </span>
      </>
    </Button>
  );
};
