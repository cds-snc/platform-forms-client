"use client";
import { LockIcon } from "@serverComponents/icons";
import { useTranslation } from "@i18n/client";
import Markdown from "markdown-to-jsx";

import { PublishedLinks } from "./PublishedLinks";

export const PublishedPreview = () => {
  const { t } = useTranslation(["common", "form-builder"]);

  return (
    <div className="my-5 flex bg-purple-200 p-5">
      <div className="flex">
        <div className="pr-7">
          <LockIcon className="mb-2 scale-125" />
        </div>
        <div>
          <Markdown options={{ forceBlock: true }}>
            {t("previewDisabledForPublishedForm", { ns: "form-builder" })}
          </Markdown>
          <PublishedLinks
            id="your-form-id"
            locale="en" // Replace with the actual locale if needed
          />
        </div>
      </div>
    </div>
  );
};
