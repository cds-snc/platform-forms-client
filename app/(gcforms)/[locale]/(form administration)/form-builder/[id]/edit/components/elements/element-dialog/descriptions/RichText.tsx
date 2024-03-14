"use client";
import React from "react";
import Markdown from "markdown-to-jsx";
import { ExampleWrapper } from "./ExampleWrapper";
import { useTranslation } from "@i18n/client";
export const RichText = () => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <h3 className="mb-0">{t("addElementDialog.richText.title")}</h3>
      <p>{t("addElementDialog.richText.description")}</p>

      <ExampleWrapper className="mt-4">
        <div className="mb-5 mt-2">
          <Markdown options={{ forceBlock: true }}>
            {t("addElementDialog.richText.example")}
          </Markdown>
        </div>

        <div className="mb-5">
          <ul>
            <li>Item</li>
            <li>Item</li>
            <li>Item</li>
          </ul>
        </div>
        <div className="mb-5">
          <ol>
            <li>Item</li>
            <li>Item</li>
            <li>Item</li>
          </ol>
        </div>
      </ExampleWrapper>
    </div>
  );
};
